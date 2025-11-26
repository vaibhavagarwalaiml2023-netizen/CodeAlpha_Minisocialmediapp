const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { addComment, getComments } = require('../controllers/commentController');

// POST /comments/add
router.post('/add', requireAuth, addComment);

// GET /comments/:postId
router.get('/:postId', getComments);

module.exports = router;
