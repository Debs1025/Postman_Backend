const Leaderboard = require('../models/leaderboardModel');

async function adjustScore(userId, delta) {
  let entry = await Leaderboard.findOneAndUpdate(
    { user: userId },
    { $inc: { score: delta } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('user', 'name email');

  // Make sure score is not negative — clamp to 0 and persist
  if (entry && entry.score < 0) {
    entry = await Leaderboard.findOneAndUpdate(
      { user: userId },
      { $set: { score: 0 } },
      { new: true }
    ).populate('user', 'name email');
  }

  return entry;
}

async function getTop(limit = 10) {
  // Ensure no negative scores exist in DB by clamping prior to returning leaderboard
  await Leaderboard.updateMany({ score: { $lt: 0 } }, { $set: { score: 0 } });

  return Leaderboard.find()
    .sort({ score: -1, updatedAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .lean();
}

async function getByUser(userId) {
  let entry = await Leaderboard.findOne({ user: userId }).lean();
  if (entry && entry.score < 0) {
    // Update DB to clamp negative score
    await Leaderboard.findOneAndUpdate({ user: userId }, { $set: { score: 0 } });
    entry.score = 0;
  }
  return entry;
}

module.exports = { adjustScore, getTop, getByUser };
