const express = require('express');
const router = express.Router();
const {
    createTest,
    getTests,
    getTest,
    submitTest,
    getMyResults,
    getTestResults
} = require('../controllers/testController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(protect); // All test routes require authentication

// Student routes
router.get('/my-results', authorize('student'), getMyResults);
router.post('/:id/submit', authorize('student'), submitTest);

// Recruiter routes
router.post('/', authorize('recruiter', 'admin'), createTest);
router.get('/:id/results', authorize('recruiter', 'admin'), getTestResults);

// General routes
router.get('/', getTests);
router.get('/:id', getTest);

module.exports = router;
