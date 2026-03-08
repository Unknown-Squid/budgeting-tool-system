const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authenticateToken = require('../../middleware/auth');
const requireAdmin = require('../../middleware/admin');
const { generalLimiter } = require('../../middleware/rateLimiter');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// System statistics
router.get('/stats', generalLimiter, AdminController.getSystemStats);

// User management routes
router.get('/users', generalLimiter, AdminController.getAllUsers);
router.get('/users/:id', generalLimiter, AdminController.getUserById);
router.post('/users', generalLimiter, AdminController.createUser);
router.put('/users/:id', generalLimiter, AdminController.updateUser);
router.delete('/users/:id', generalLimiter, AdminController.deleteUser);
router.get('/users/:id/stats', generalLimiter, AdminController.getUserStats);

module.exports = router;
