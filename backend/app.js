require('dotenv').config();

const express  = require('express');
const path     = require('path');
const http     = require('http');
const logger   = require('morgan');
const cors          = require('cors');
const helmet        = require('helmet');
const rateLimit     = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const createError   = require('http-errors');
const connectDB     = require('./config/database');
const errorHandler  = require('./middleware/errorHandler');

// ── Route imports ─────────────────────────────────────────────────────────────
const userRouter           = require('./routes/user');
const videoRouter          = require('./routes/video');
const bookRouter           = require('./routes/book');
const passwordRouter       = require('./routes/resetpassword');
const journalRouter        = require('./routes/journal');
const emotiontimeRouter    = require('./routes/emotiontime');
const journaltimeRouter    = require('./routes/journaltime');
const meditationtimeRouter = require('./routes/meditationtime');
const reviewRouter         = require('./routes/review');
const verifyuserRouter     = require('./routes/verifyuser');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
}));

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── NoSQL injection sanitization ──────────────────────────────────────────────
app.use(mongoSanitize());

// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts — please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please try again later.' },
});

app.use('/user/signin',       authLimiter);
app.use('/user/admin-signin', authLimiter);
app.use('/user/signup',       authLimiter);
app.use('/password',          authLimiter);
app.use('/verifyuser',        authLimiter);

app.use(apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/user',           userRouter);
app.use('/videos',         videoRouter);
app.use('/books',          bookRouter);
app.use('/password',       passwordRouter);
app.use('/journal',        journalRouter);
app.use('/emotiontime',    emotiontimeRouter);
app.use('/journaltime',    journaltimeRouter);
app.use('/meditationtime', meditationtimeRouter);
app.use('/review',         reviewRouter);
app.use('/verifyuser',     verifyuserRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ── Dialogflow webhook ────────────────────────────────────────────────────────
app.post('/dialogflow', (req, res) => {
  const queryResult = req.body && req.body.queryResult;
  if (!queryResult) {
    return res.status(400).json({ fulfillmentText: 'Malformed request.' });
  }
  const { action } = queryResult;
  res.json({
    fulfillmentText: action === 'input.unknown'
      ? "I'm here to listen. Could you tell me a little more?"
      : `I don't have a handler for the action "${action}".`,
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res, next) => next(createError(404)));

// ── Centralized error handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Server (starts only after DB is ready) ────────────────────────────────────
if (require.main === module) {
  connectDB()
    .then(() => {
      const port = process.env.PORT || 3000;
      const server = http.createServer(app).listen(port, () => {
        console.log(`Server listening on port ${port}`);
      });

      const shutdown = (signal) => {
        console.log(`${signal} received — shutting down gracefully`);
        server.close(() => {
          console.log('HTTP server closed');
          process.exit(0);
        });
        // Force exit if server doesn't close within 10 s
        setTimeout(() => process.exit(1), 10_000).unref();
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT',  () => shutdown('SIGINT'));
    })
    .catch((err) => {
      console.error('DB connection failed:', err);
      process.exit(1);
    });
}

module.exports = app;
