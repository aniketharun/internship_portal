const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private (Recruiter/Admin)
exports.createTest = async (req, res, next) => {
    try {
        req.body.createdBy = req.user._id;

        // Ensure general mock tests are marked correctly
        if (!req.body.company) {
            req.body.type = 'MOCK';
        } else {
            req.body.type = 'COMPANY_SPECIFIC';
        }

        const test = await Test.create(req.body);

        res.status(201).json({
            success: true,
            data: test
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all available tests
// @route   GET /api/tests
// @access  Private
exports.getTests = async (req, res, next) => {
    try {
        const tests = await Test.find()
            .select('-questions.correctOption') // Hide correct options in list view
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tests.length,
            data: tests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single test details
// @route   GET /api/tests/:id
// @access  Private
exports.getTest = async (req, res, next) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test) {
            return next(new AppError('Test not found', 404));
        }

        // Hide correct options if the user is a student
        let testData = test.toObject();
        if (req.user.role === 'student') {
            testData.questions = testData.questions.map(q => {
                const { correctOption, ...rest } = q;
                return rest;
            });
        }

        res.status(200).json({
            success: true,
            data: testData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit test answers
// @route   POST /api/tests/:id/submit
// @access  Private (Student)
exports.submitTest = async (req, res, next) => {
    try {
        const { answers } = req.body; // Array of { questionId, selectedOption }
        const test = await Test.findById(req.params.id);

        if (!test) {
            return next(new AppError('Test not found', 404));
        }

        if (req.user.role !== 'student') {
            return next(new AppError('Only students can submit tests', 403));
        }

        let score = 0;
        const processedAnswers = test.questions.map(question => {
            const studentAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
            const selectedOption = studentAnswer ? studentAnswer.selectedOption : null;
            const isCorrect = selectedOption === question.correctOption;

            if (isCorrect) score++;

            return {
                questionId: question._id,
                selectedOption,
                isCorrect
            };
        });

        const result = await TestResult.create({
            student: req.user._id,
            test: test._id,
            score,
            totalQuestions: test.questions.length,
            answers: processedAnswers
        });

        // Award badge if score >= 80%
        const percentage = (score / test.questions.length) * 100;
        if (percentage >= 80) {
            const user = await User.findById(req.user._id);
            if (user) {
                // Check if badge already exists for this test title
                const badgeExists = user.badges.some(b => b.title === test.title);
                if (!badgeExists) {
                    user.badges.push({
                        title: test.title,
                        testId: test._id,
                        score: percentage,
                        awardedAt: new Date()
                    });
                    await user.save();
                }
            }
        }

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student's own test results
// @route   GET /api/tests/my-results
// @access  Private (Student)
exports.getMyResults = async (req, res, next) => {
    try {
        const results = await TestResult.find({ student: req.user._id })
            .populate('test', 'title company type')
            .sort('-completedAt');

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get results for a specific test (for recruiter)
// @route   GET /api/tests/:id/results
// @access  Private (Recruiter/Admin)
exports.getTestResults = async (req, res, next) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test) {
            return next(new AppError('Test not found', 404));
        }

        // Check if user is the creator or admin
        if (test.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to view these results', 403));
        }

        const results = await TestResult.find({ test: req.params.id })
            .populate('student', 'name email')
            .sort('-score');

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        next(error);
    }
};
