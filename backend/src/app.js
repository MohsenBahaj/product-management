require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rate-limit.middleware');
const { swaggerServe, swaggerSetup } = require('./config/swagger');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Request logging (skip in test env)
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI — no rate limiting applied here
app.use('/api-docs', swaggerServe, swaggerSetup);

// Global API rate limiter
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;
