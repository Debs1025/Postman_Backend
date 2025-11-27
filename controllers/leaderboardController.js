const leaderboardService = require('../services/leaderboardService');

async function adjust(req, res) {
  try {
    const { success } = req.body;
    const delta = success ? 1 : -1;
    const entry = await leaderboardService.adjustScore(req.user._id, delta);
    return res.json({ score: entry.score });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function top(req, res) {
  try {
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
    const list = await leaderboardService.getTop(limit);
    const items = list.map((i) => ({ userId: i.user._id, name: i.user.name, score: i.score }));
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function me(req, res) {
  try {
    const entry = await leaderboardService.getByUser(req.user._id);
    return res.json({ score: entry ? entry.score : 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { adjust, top, me };
