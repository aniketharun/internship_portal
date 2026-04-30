const express = require('express');
const router = express.Router();
const { analyzeResumeStrength } = require('../controllers/resumeController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

// All routes here are protected and for students only
router.use(protect);
router.use(authorize('student'));

router.post('/resume-strength', upload.single('resume'), analyzeResumeStrength);

module.exports = router;
