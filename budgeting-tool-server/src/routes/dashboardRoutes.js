const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../../middleware/auth');
const { generalLimiter } = require('../../middleware/rateLimiter');

router.get('/stats', authenticateToken, generalLimiter, DashboardController.getStats);

module.exports = router;
