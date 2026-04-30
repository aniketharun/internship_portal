const express = require('express');
const router = express.Router();
const {
    addProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('student')); // Only students can manage their projects

router.post('/', addProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

module.exports = router;
