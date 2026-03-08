const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  next();
};

const validateBudget = (req, res, next) => {
  const { category, limit, startDate, endDate } = req.body;

  if (!category || limit === undefined || !startDate || !endDate) {
    return res.status(400).json({ error: 'Category, limit, start date, and end date are required' });
  }

  if (isNaN(limit) || parseFloat(limit) <= 0) {
    return res.status(400).json({ error: 'Limit must be a positive number' });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    return res.status(400).json({ error: 'Invalid start date format' });
  }
  
  if (isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid end date format' });
  }
  
  if (end <= start) {
    return res.status(400).json({ error: 'End date must be after start date' });
  }

  next();
};

const validateTransaction = (req, res, next) => {
  const { description, amount, category, type } = req.body;

  if (!description || amount === undefined || !category || !type) {
    return res.status(400).json({ error: 'Description, amount, category, and type are required' });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const validTypes = ['income', 'expense'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Type must be income or expense' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateBudget,
  validateTransaction
};
