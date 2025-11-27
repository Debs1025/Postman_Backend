const Leaderboard = require('../models/leaderboardModel');

async function adjustScore(userId, delta) {
  let entry = await Leaderboard.findOneAndUpdate(
    { user: userId },
    { $inc: { score: delta } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('user', 'name email');

  // Clamp negative scores to 0
  if (entry && entry.score < 0) {
    entry = await Leaderboard.findOneAndUpdate(
      { user: userId },
      { $set: { score: 0 } },
      { new: true }
    ).populate('user', 'name email');
  }

  return entry;
}

/**
 * Award a point for a specific question index only if the user's progress
 * matches the questionIndex. If the user has no entry and questionIndex is 0,
 * award the point and create the entry.
 */
async function awardPointForQuestion(userId, questionIndex) {
  // Try to atomically increment if progress matches
  let entry = await Leaderboard.findOne({ user: userId });

  if (!entry) {
    // If no entry exists and the questionIndex is 0, create and award
    if (questionIndex === 0) {
      entry = await Leaderboard.findOneAndUpdate(
        { user: userId },
        { $inc: { score: 1 }, $set: { progress: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).populate('user', 'name email');
      return entry;
    }
    // If no entry and questionIndex > 0, ensure an entry exists with progress 0
    entry = await Leaderboard.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { progress: 0 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('user', 'name email');
    return entry;
  }

  // Atomically increment only if progress equals questionIndex
  const updated = await Leaderboard.findOneAndUpdate(
    { user: userId, progress: questionIndex },
    { $inc: { score: 1, progress: 1 } },
    { new: true }
  ).populate('user', 'name email');

  // If updated is null, the user's progress did not match questionIndex => no score change
  return updated || entry;
}

async function getTop(limit = 10) {
  // Clean up any negative scores before returning the leaderboard
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
    await Leaderboard.findOneAndUpdate({ user: userId }, { $set: { score: 0 } });
    entry.score = 0;
  }
  return entry;
}

module.exports = { adjustScore, getTop, getByUser, awardPointForQuestion };
