const User = require('../models/User');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // --- Input validation ---------------------------------------------------
        if (!name || !email || !password) {
            return next(new AppError('Please provide name, email, and password', 400));
        }

        // --- Check if user already exists ---------------------------------------
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('A user with this email already exists', 400));
        }

        // --- Create user (password is hashed via pre-save hook) -----------------
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student', // default role
        });

        // --- Generate JWT and respond ------------------------------------------
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user & return JWT
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // --- Input validation ---------------------------------------------------
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // --- Find user and explicitly select password ---------------------------
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new AppError('Invalid email or password', 401));
        }

        // --- Compare passwords --------------------------------------------------
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new AppError('Invalid email or password', 401));
        }

        // --- Generate JWT and respond ------------------------------------------
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
    try {
        // req.user is set by the protect middleware (authMiddleware)
        const user = await User.findById(req.user._id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload Certificate
// @route   POST /api/auth/uploadcertificate
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadCertificate = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }

        const fileUrl = `/uploads/certificates/${req.file.filename}`;

        res.status(200).json({
            success: true,
            data: fileUrl,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload Profile Picture
// @route   POST /api/auth/uploadprofilepic
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please upload an image', 400));
        }

        const fileUrl = `/uploads/profile_pics/${req.file.filename}`;

        // Update user's profile picture in the database immediately
        await User.findByIdAndUpdate(req.user._id, { profilePicture: fileUrl });

        res.status(200).json({
            success: true,
            data: fileUrl,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update current user's profile
// @route   PUT /api/auth/updatedetails
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            dob: req.body.dob,
            linkedin: req.body.linkedin,
            github: req.body.github,
            certificates: req.body.certificates,
            education: req.body.education,
            profilePicture: req.body.profilePicture,
        };

        const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(new AppError('There is no user with that email', 404));
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://localhost:5173/resetpassword/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            // In a real app, you would send an email here.
            // For now, we just log it to the console.
            console.log('----------------------------------------------------');
            console.log(`RESET PASSWORD TOKEN: ${resetToken}`);
            console.log(`RESET URL: ${resetUrl}`);
            console.log('----------------------------------------------------');

            res.status(200).json({
                success: true,
                data: 'Email sent (check server console)',
            });
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return next(new AppError('Email could not be sent', 500));
        }
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return next(new AppError('Invalid token', 400));
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public user info
// @route   GET /api/auth/users/:id
// @access  Private
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('name email profilePicture role');
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const https = require('https');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Google Login/Register (uses access_token from @react-oauth/google)
// @route   POST /api/auth/google
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────

// Helper: fetch Google userinfo using access token
const getGoogleUserInfo = (accessToken) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.googleapis.com',
            path: '/oauth2/v3/userinfo',
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
};

const googleLogin = async (req, res, next) => {
    try {
        // Support both access_token (from useGoogleLogin) and tokenId (legacy)
        const accessToken = req.body.tokenId || req.body.access_token;

        if (!accessToken) {
            return next(new AppError('No token provided', 400));
        }

        // Fetch user info from Google using the access token
        const googleRes = await getGoogleUserInfo(accessToken);

        if (googleRes.error) {
            return next(new AppError('Invalid Google token', 401));
        }

        const { name, email, sub, picture } = googleRes;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new Google user
            user = await User.create({
                name,
                email,
                googleId: sub,
                isGoogleAccount: true,
                profilePicture: picture,
                role: 'student', // Default role for Google sign-up
            });
        } else if (!user.isGoogleAccount) {
            // Link existing account to Google if not already linked
            user.googleId = sub;
            user.isGoogleAccount = true;
            if (!user.profilePicture) user.profilePicture = picture;
            await user.save();
        }

        // Generate JWT
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                token,
            },
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        next(new AppError('Google authentication failed', 401));
    }
};

module.exports = { registerUser, loginUser, getMe, updateDetails, uploadCertificate, uploadProfilePicture, forgotPassword, resetPassword, getUser, googleLogin };
