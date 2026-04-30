const express = require('express');
const router = express.Router();
const {
    getPosts,
    createPost,
    likePost,
    addComment
} = require('../controllers/postController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getPosts)
    .post(createPost);

router.put('/:id/like', likePost);
router.post('/:id/comment', addComment);

module.exports = router;
