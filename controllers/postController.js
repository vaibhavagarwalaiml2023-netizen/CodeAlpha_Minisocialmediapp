// Post controller: create post, list posts (feed), single post, like/unlike
const Post = require('../models/Post');
const User = require('../models/User');

// Create a post. Expects { text, image }
async function createPost(req, res) {
  try {
    const userId = req.user.id;
    const { text, image } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });
    const post = new Post({ userId, text, image: image || '' });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get posts (feed). If user logged in, show posts from followed users + own posts. Otherwise return all posts.
async function getPosts(req, res) {
  try {
    let posts;
    if (req.user && req.user.id) {
      const me = await User.findById(req.user.id);
      const ids = [req.user.id, ...me.following];
      posts = await Post.find({ userId: { $in: ids } }).sort({ createdAt: -1 }).populate('userId', 'username avatar');
    } else {
      posts = await Post.find().sort({ createdAt: -1 }).populate('userId', 'username avatar');
    }
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get single post by id
async function getPost(req, res) {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).populate('userId', 'username avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Like or unlike post (toggle)
async function toggleLike(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const exists = post.likes.find(l => l.toString() === userId);
    if (exists) {
      post.likes = post.likes.filter(l => l.toString() !== userId);
      await post.save();
      return res.json({ message: 'Unliked', likesCount: post.likes.length });
    } else {
      post.likes.push(userId);
      await post.save();
      return res.json({ message: 'Liked', likesCount: post.likes.length });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createPost, getPosts, getPost, toggleLike };
