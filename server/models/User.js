const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // allow null for non-google users
        },
        isGoogleAccount: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: {
                values: ['student', 'recruiter', 'admin'],
                message: 'Role must be either student, recruiter, or admin',
            },
            default: 'student',
        },
        profilePicture: {
            type: String,
            default: '',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        dob: {
            type: Date,
        },
        linkedin: {
            type: String,
            trim: true,
        },
        github: {
            type: String,
            trim: true,
        },
        certificates: [
            {
                title: String,
                link: String,
                file: String,
            },
        ],
        projects: [
            {
                title: { type: String, required: true },
                description: { type: String, required: true },
                technologies: [String],
                githubLink: String,
                liveLink: String,
                thumbnail: String,
            },
        ],
        badges: [
            {
                title: String,
                testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
                score: Number,
                awardedAt: { type: Date, default: Date.now }
            }
        ],
        education: {
            tenth: {
                school: String,
                percentage: Number,
                year: Number,
            },
            twelfth: {
                school: String,
                percentage: Number,
                year: Number,
            },
            degree: {
                college: String,
                major: String,
                cgpa: Number,
                year: Number,
            },
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        resume: {
            type: String,
            default: '',
        },
        atsScore: {
            type: Number,
            default: 0,
        },
        resumeAnalysis: {
            score: Number,
            feedback: [String],
            lastAnalyzed: Date
        }
    },
    {
        timestamps: false, // we use our own createdAt field
    }
);

// ---------------------------------------------------------------------------
// Pre-save hook — hash password before saving to the database
// ---------------------------------------------------------------------------
userSchema.pre('save', async function () {
    // Only hash if the password field has been modified (or is new) AND exists
    if (!this.isModified('password') || !this.password) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ---------------------------------------------------------------------------
// Instance method — compare entered password with the stored hash
// ---------------------------------------------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ---------------------------------------------------------------------------
// Instance method — generate and hash password reset token
// ---------------------------------------------------------------------------
const crypto = require('crypto');

userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
