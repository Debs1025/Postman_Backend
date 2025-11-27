const Leaderboard = require('../models/leaderboardModel');

async function adjustScore(userId, delta) {
  return Leaderboard.findOneAndUpdate(
    { user: userId },
    { $inc: { score: delta } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('user', 'name email');
}

async function getTop(limit = 10) {
  return Leaderboard.find()
    .sort({ score: -1, updatedAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .lean();
}

async function getByUser(userId) {
  return Leaderboard.findOne({ user: userId }).lean();
}

module.exports = { adjustScore, getTop, getByUser };