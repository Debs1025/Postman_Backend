require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoute = require('./routes/userRoute');
const leaderboardRoute = require('./routes/leaderboardRoute');

const { MONGO_URI, PORT = 4000, CORS_ORIGIN = 'http://localhost:4000', JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');
if (!MONGO_URI) throw new Error('Missing MONGO_URI');

const app = express();

// health
app.get('/api', (req, res) => res.json({ message: 'API running' }));

// Middlewares
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '5mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.use('/api/users', userRoute);
app.use('/api/leaderboard', leaderboardRoute);

// Handlers
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

async function start() {
  if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');
  if (!MONGO_URI) throw new Error('Missing MONGO_URI');

  await mongoose.connect(MONGO_URI);
  app.locals.db = mongoose.connection;
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  const shutdown = async () => {
    server.close(() => {});
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;

if (require.main === module) {
  start().catch((err) => {
    console.error('Startup error', err);
    process.exit(1);
  });
}