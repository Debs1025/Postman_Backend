// api/index.js
require('dotenv').config();
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../server');

const MONGO_URI = process.env.MONGO_URI || '';
let dbConnected = false;

const MONGO_OPTIONS = {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function connectDbOnce() {
  if (dbConnected) return;
  if (!MONGO_URI) {
    console.warn('MONGO_URI not set - continuing without DB (use Vercel env vars)');
    return;
  }
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
      console.log('MongoDB connected (serverless).');
      dbConnected = true;
    } catch (err) {
      console.error('MongoDB connection failed:', err && err.message ? err.message : err);
      throw err;
    }
  } else {
    dbConnected = true;
  }
}

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await connectDbOnce();
    return handler(req, res);
  } catch (err) {
    console.error('Handler error (likely DB):', err && err.message ? err.message : err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'internal server error', reason: err && err.message ? err.message : 'unknown' }));
  }
};
