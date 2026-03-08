// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./configs/dbConfig');
require('./src/models'); // Load all models and associations

const authRoutes = require('./src/routes/authRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const logRoutes = require('./src/routes/logRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const CleanupService = require('./src/services/cleanupService');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (use { force: true } only in development to drop tables)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes);

// Cleanup function - runs daily at midnight
const runCleanup = async () => {
  try {
    await CleanupService.cleanupExpiredBudgetsAndTransactions();
  } catch (error) {
    console.error('Error running cleanup:', error);
  }
};

// Schedule cleanup to run daily
const scheduleCleanup = () => {
  // Run cleanup immediately on startup
  runCleanup();
  
  // Then run cleanup every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    runCleanup();
  }, TWENTY_FOUR_HOURS);
  
  console.log('Cleanup service scheduled to run daily');
};

// Start server
const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Start cleanup scheduler
  scheduleCleanup();
};

startServer();
