// Comment controller: add comment and fetch comments for a post
const Comment = require('../models/Comment');

// Add a comment. Expects { postId, text }
async function addComment(req, res) {
  try {
    const userId = req.user.id;
    const { postId, text } = req.body;
    if (!postId || !text) return res.status(400).json({ message: 'Missing fields' });
    const comment = new Comment({ postId, userId, text });
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get comments for a post
async function getComments(req, res) {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 }).populate('userId', 'username avatar');
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { addComment, getComments };
