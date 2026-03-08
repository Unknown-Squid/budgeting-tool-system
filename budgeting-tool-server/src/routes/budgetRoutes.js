const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const authenticateToken = require('../../middleware/auth');
const { validateBudget } = require('../../middleware/validators');
const { budgetLimiter, generalLimiter } = require('../../middleware/rateLimiter');

router.get('/', generalLimiter, authenticateToken, BudgetController.getAll);
router.post('/', authenticateToken, budgetLimiter, validateBudget, BudgetController.create);
router.put('/:id', authenticateToken, budgetLimiter, BudgetController.update);
router.delete('/:id', authenticateToken, budgetLimiter, BudgetController.delete);

module.exports = router;
