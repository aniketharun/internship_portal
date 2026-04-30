const express = require('express');
const router = express.Router();

const {
    createInternship,
    getInternships,
    getInternship,
    updateInternship,
    deleteInternship,
} = require('../controllers/internshipController');

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getInternships);
router.get('/:id', getInternship);

// Protected routes (Recruiter/Admin only for creation)
router.post('/', protect, authorizeRoles('recruiter', 'admin'), createInternship);

// Protected routes (Owner/Admin for update/delete)
router.put('/:id', protect, authorizeRoles('recruiter', 'admin'), updateInternship);
router.delete('/:id', protect, authorizeRoles('recruiter', 'admin'), deleteInternship);

module.exports = router;
