const express = require('express');
const {
    applyForInternship,
    getMyApplications,
    getInternshipApplications,
    updateApplicationStatus
} = require('../controllers/applicationController');
const protect = require('../middleware/authMiddleware');

const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All routes require login

router.post('/', authorize('student'), upload.single('resume'), applyForInternship);
router.get('/my-applications', authorize('student'), getMyApplications);
router.get('/internship/:internshipId', authorize('recruiter', 'admin'), getInternshipApplications);
router.put('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
