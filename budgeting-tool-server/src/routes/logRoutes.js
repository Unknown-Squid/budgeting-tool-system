const express = require('express');
const router = express.Router();
const LogController = require('../controllers/logController');
const authenticateToken = require('../../middleware/auth');
const { generalLimiter } = require('../../middleware/rateLimiter');

router.get('/', authenticateToken, generalLimiter, LogController.getAll);

module.exports = router;
