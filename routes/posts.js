const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { createPost, getPosts, getPost, toggleLike } = require('../controllers/postController');

// POST /posts/create
router.post('/create', requireAuth, createPost);

// GET /posts - feed (optional auth)
router.get('/', optionalAuth, getPosts);

// GET /posts/:id - single post
router.get('/:id', getPost);

// POST /posts/like/:id - toggle like
router.post('/like/:id', requireAuth, toggleLike);

module.exports = router;
