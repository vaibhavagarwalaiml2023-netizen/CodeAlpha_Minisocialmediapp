// User controller: profile viewing, edit profile, follow/unfollow
const User = require('../models/User');

// Get user profile by id
// Returns public profile data and counts
async function getProfile(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password').populate('followers following', 'username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const profile = {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    };
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Edit profile (name, bio, avatar)
// Expects { username, bio, avatar }
async function editProfile(req, res) {
  try {
    const userId = req.user.id;
    const { username, bio, avatar } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Follow a user
async function followUser(req, res) {
  try {
    const meId = req.user.id;
    const targetId = req.params.id;
    if (meId === targetId) return res.status(400).json({ message: "Can't follow yourself" });
    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (!me.following.includes(targetId)) {
      me.following.push(targetId);
      target.followers.push(meId);
      await me.save();
      await target.save();
    }
    res.json({ message: 'Followed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Unfollow a user
async function unfollowUser(req, res) {
  try {
    const meId = req.user.id;
    const targetId = req.params.id;
    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    me.following = me.following.filter(f => f.toString() !== targetId);
    target.followers = target.followers.filter(f => f.toString() !== meId);
    await me.save();
    await target.save();
    res.json({ message: 'Unfollowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getProfile, editProfile, followUser, unfollowUser };
