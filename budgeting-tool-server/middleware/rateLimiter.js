const rateLimit = require('express-rate-limit');

// Rate limiter for login endpoint - 3 requests per minute
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again after a minute.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests too
});

// Rate limiter for register endpoint - 3 requests per minute
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per windowMs
  message: {
    error: 'Too many registration attempts, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for budget operations (create, update, delete) - 5 requests per minute
const budgetLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per windowMs
  message: {
    error: 'Too many budget operations, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use user ID if authenticated, otherwise use IP with proper IPv6 handling
    if (req.user) {
      return req.user.id;
    }
    // Use the default IP key generator which handles IPv6 properly
    return rateLimit.ipKeyGenerator(req, res);
  },
});

// Rate limiter for transaction operations (create, update, delete) - 5 requests per minute
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per windowMs
  message: {
    error: 'Too many transaction operations, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use user ID if authenticated, otherwise use IP with proper IPv6 handling
    if (req.user) {
      return req.user.id;
    }
    // Use the default IP key generator which handles IPv6 properly
    return rateLimit.ipKeyGenerator(req, res);
  },
});

// Rate limiter for general API endpoints - 20 requests per minute
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per windowMs
  message: {
    error: 'Too many requests, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use user ID if authenticated, otherwise use IP with proper IPv6 handling
    if (req.user) {
      return req.user.id;
    }
    // Use the default IP key generator which handles IPv6 properly
    return rateLimit.ipKeyGenerator(req, res);
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  budgetLimiter,
  transactionLimiter,
  generalLimiter,
};
