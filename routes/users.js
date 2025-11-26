const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getProfile, editProfile, followUser, unfollowUser } = require('../controllers/userController');

// GET /users/:id - public profile
router.get('/:id', getProfile);

// PUT /users/:id - edit profile (only for authenticated user editing themself)
router.put('/:id', requireAuth, editProfile);

// POST /users/follow/:id
router.post('/follow/:id', requireAuth, followUser);

// POST /users/unfollow/:id
router.post('/unfollow/:id', requireAuth, unfollowUser);

module.exports = router;
