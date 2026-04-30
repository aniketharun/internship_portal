const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Add a new project to user profile
// @route   POST /api/projects
// @access  Private (Student)
exports.addProject = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        user.projects.unshift(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            data: user.projects
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a project in user profile
// @route   PUT /api/projects/:projectId
// @access  Private (Student)
exports.updateProject = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const projectIndex = user.projects.findIndex(
            (p) => p._id.toString() === req.params.projectId
        );

        if (projectIndex === -1) {
            return next(new AppError('Project not found', 404));
        }

        // Update fields
        user.projects[projectIndex] = {
            ...user.projects[projectIndex].toObject(),
            ...req.body
        };

        await user.save();

        res.status(200).json({
            success: true,
            data: user.projects
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a project from user profile
// @route   DELETE /api/projects/:projectId
// @access  Private (Student)
exports.deleteProject = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        user.projects = user.projects.filter(
            (p) => p._id.toString() !== req.params.projectId
        );

        await user.save();

        res.status(200).json({
            success: true,
            data: user.projects
        });
    } catch (error) {
        next(error);
    }
};
