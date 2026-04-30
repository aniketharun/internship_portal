const Internship = require('../models/Internship');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { calculateMatchScore } = require('../utils/matchUtils');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new internship
// @route   POST /api/internships
// @access  Private (Recruiter/Admin)
// ─────────────────────────────────────────────────────────────────────────────
const createInternship = async (req, res, next) => {
    try {
        req.body.postedBy = req.user._id;

        const internship = await Internship.create(req.body);

        // Create notification for all students
        try {
            const students = await User.find({ role: 'student' });
            const notifications = students.map(student => ({
                recipient: student._id,
                type: 'NEW_INTERNSHIP',
                message: `New internship posted: ${internship.title} at ${internship.company}`,
                link: `/internships/${internship._id}`
            }));
            await Notification.insertMany(notifications);
        } catch (err) {
            console.error('Failed to create internship notifications', err);
            // Don't fail the request if notification fails
        }

        res.status(201).json({
            success: true,
            data: internship,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getInternships = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, keyword, location, experienceLevel } = req.query;
        console.log(`Backend: Fetching internships with limit: ${limit}, page: ${page}`);

        // Build query
        const query = {};

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { company: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (experienceLevel) {
            query.experienceLevel = experienceLevel;
        }

        // Pagination setup
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Internship.countDocuments(query);

        const internships = await Internship.find(query)
            .populate({
                path: 'postedBy',
                select: 'name email',
            })
            .sort({ isFeatured: -1, createdAt: -1 }) // Featured first, then newest
            .skip(skip)
            .limit(parseInt(limit));

        let data = internships;
        if (req.user && req.user.role === 'student') {
            data = internships.map(internship => {
                const { score, missingSkills } = calculateMatchScore(req.user, internship);
                return {
                    ...internship.toObject(),
                    matchScore: score,
                    missingSkills
                };
            });
        }

        res.status(200).json({
            success: true,
            count: data.length,
            total,
            pages: Math.ceil(total / limit),
            data: data,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getInternship = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.id).populate({
            path: 'postedBy',
            select: 'name email',
        });

        if (!internship) {
            return next(new AppError('Internship not found', 404));
        }

        let internshipData = internship.toObject();
        if (req.user && req.user.role === 'student') {
            const { score, missingSkills } = calculateMatchScore(req.user, internship);
            internshipData.matchScore = score;
            internshipData.missingSkills = missingSkills;
        }

        res.status(200).json({
            success: true,
            data: internshipData,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Owner/Admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateInternship = async (req, res, next) => {
    try {
        let internship = await Internship.findById(req.params.id);

        if (!internship) {
            return next(new AppError('Internship not found', 404));
        }

        // Make sure user is internship owner or admin
        if (internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to update this internship', 403));
        }

        internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: internship,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Owner/Admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteInternship = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return next(new AppError('Internship not found', 404));
        }

        // Make sure user is internship owner or admin
        if (internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to delete this internship', 403));
        }

        await Internship.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createInternship,
    getInternships,
    getInternship,
    updateInternship,
    deleteInternship,
};
