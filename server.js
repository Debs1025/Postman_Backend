require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoute = require('./routes/userRoute');
const leaderboardRoute = require('./routes/leaderboardRoute');

// 1. UPDATED VARIABLE DESTRUCTURING AND CORS LOGIC
// Destructure the necessary environment variables.
// Use PORT=4000 as default.
// CORS_ORIGIN is used to get the value from the .env file (e.g., "http://localhost:3000,https://production.app").
const { MONGO_URI, PORT = 4000, CORS_ORIGIN, JWT_SECRET } = process.env;

if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');
if (!MONGO_URI) throw new Error('Missing MONGO_URI');

// Define the origins:
// If CORS_ORIGIN is set, split the comma-separated string into an array.
// Otherwise, use the hardcoded defaults for local development and production.
const allowedOrigins = CORS_ORIGIN 
    ? CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'https://capture-the-postman.vercel.app'];


const app = express();

// health
app.get('/api', (req, res) => res.json({ message: 'API running' }));

// Redirect root to /api
app.get('/', (req, res) => res.redirect('/api'));

// Middlewares
app.use(helmet());

// 2. UPDATED CORS MIDDLEWARE
// Pass the allowedOrigins array to the cors middleware
app.use(cors({ origin: allowedOrigins })); 

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
