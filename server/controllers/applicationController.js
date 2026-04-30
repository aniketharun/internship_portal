const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

// @desc    Apply for an internship
// @route   POST /api/applications
// @access  Private (Student)
exports.applyForInternship = async (req, res, next) => {
    try {
        let { internshipId, resumeUrl, coverLetter } = req.body;

        // Start with file upload check
        if (req.file) {
            // If file uploaded, create the URL path
            // Assumption: server serves 'public' folder at root
            resumeUrl = `/uploads/resumes/${req.file.filename}`;
        }

        // If no file and no URL provided
        if (!resumeUrl) {
            return next(new AppError('Please provide a resume (Link or File)', 400));
        }

        // Check if internship exists
        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return next(new AppError('Internship not found', 404));
        }

        // Check if user is a student (redundant with middleware but good for safety)
        if (req.user.role !== 'student') {
            return next(new AppError('Only students can apply for internships', 403));
        }

        // Check for existing application
        const existingApplication = await Application.findOne({
            internship: internshipId,
            student: req.user._id
        });

        if (existingApplication) {
            return next(new AppError('You have already applied for this internship', 400));
        }

        const application = await Application.create({
            internship: internshipId,
            student: req.user._id,
            resumeUrl,
            coverLetter
        });

        // Notify the student that their application was received
        try {
            await Notification.create({
                recipient: req.user._id,
                type: 'APPLICATION_UPDATE',
                message: `Your application for "${internship.title}" at ${internship.company} has been submitted successfully. You'll be notified when the recruiter reviews it.`,
                link: '/my-applications'
            });
        } catch (err) {
            console.error('Failed to create application confirmation notification', err);
        }

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in student's applications
// @route   GET /api/applications/my-applications
// @access  Private (Student)
exports.getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate({
                path: 'internship',
                select: 'title company location status'
            })
            .sort('-appliedAt');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get applications for a specific internship
// @route   GET /api/applications/internship/:internshipId
// @access  Private (Recruiter/Admin)
exports.getInternshipApplications = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.internshipId);

        if (!internship) {
            return next(new AppError('Internship not found', 404));
        }

        // Check authorization (internship owner or admin)
        if (internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to view these applications', 403));
        }

        const applications = await Application.find({ internship: req.params.internshipId })
            .populate({
                path: 'student',
                select: 'name email profilePicture projects badges'
            })
            .sort('-appliedAt');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter/Admin)
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        let application = await Application.findById(req.params.id).populate('internship');

        if (!application) {
            return next(new AppError('Application not found', 404));
        }

        // Check authorization
        if (application.internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to update this application', 403));
        }

        application.status = status;
        await application.save();

        // Create notification for the student
        try {
            await Notification.create({
                recipient: application.student,
                type: 'APPLICATION_UPDATE',
                message: `Your application for "${application.internship.title}" has been updated to: ${status}`,
                link: '/my-applications'
            });
        } catch (err) {
            console.error('Failed to create application update notification', err);
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};
