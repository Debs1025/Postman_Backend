require('dotenv').config();
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../server');

const { MONGO_URI } = process.env;

let cached = false;
async function ensureDb() {
  if (cached) return;
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI env var for serverless function');
    return;
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
    app.locals.db = mongoose.connection;
  }
  cached = true;
}

module.exports = async (req, res) => {
  try {
    await ensureDb();
    const handler = serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error('Serverless handler error', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error' }));
  }
};