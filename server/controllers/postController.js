const Post = require('../models/Post');
const AppError = require('../utils/AppError');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
exports.getPosts = async (req, res, next) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        const posts = await Post.find(query)
            .populate('author', 'name profilePicture role')
            .populate('comments.user', 'name profilePicture')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
    try {
        req.body.author = req.user._id;

        const post = await Post.create(req.body);

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Like / Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(new AppError('Post not found', 404));
        }

        const isLiked = post.likes.includes(req.user._id);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();

        res.status(200).json({
            success: true,
            data: post.likes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(new AppError('Post not found', 404));
        }

        const newComment = {
            user: req.user._id,
            text: req.body.text
        };

        post.comments.push(newComment);
        await post.save();

        const updatedPost = await Post.findById(req.params.id).populate('comments.user', 'name profilePicture');

        res.status(200).json({
            success: true,
            data: updatedPost.comments
        });
    } catch (error) {
        next(error);
    }
};
