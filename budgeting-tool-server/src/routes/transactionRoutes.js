const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authenticateToken = require('../../middleware/auth');
const { validateTransaction } = require('../../middleware/validators');
const { transactionLimiter, generalLimiter } = require('../../middleware/rateLimiter');

router.get('/', generalLimiter, authenticateToken, TransactionController.getAll);
router.post('/', authenticateToken, transactionLimiter, validateTransaction, TransactionController.create);
router.put('/:id', authenticateToken, transactionLimiter, TransactionController.update);
router.delete('/:id', authenticateToken, transactionLimiter, TransactionController.delete);

module.exports = router;
