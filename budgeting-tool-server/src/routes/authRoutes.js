const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticateToken = require('../../middleware/auth');
const { validateRegister, validateLogin } = require('../../middleware/validators');
const { loginLimiter, registerLimiter, generalLimiter } = require('../../middleware/rateLimiter');

router.post('/register', registerLimiter, validateRegister, AuthController.register);
router.post('/login', loginLimiter, validateLogin, AuthController.login);
router.post('/refresh', generalLimiter, AuthController.refreshToken);
router.post('/logout', generalLimiter, AuthController.logout);
router.post('/logout-all', authenticateToken, generalLimiter, AuthController.logoutAll);
router.get('/sessions', authenticateToken, generalLimiter, AuthController.getSessions);
router.get('/me', authenticateToken, generalLimiter, AuthController.getMe);

module.exports = router;
