const User = require('../models/User');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Session = require('../models/Session');
const UserActivity = require('../models/UserActivity');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class AdminService {
  // Get all users with pagination
  static async getAllUsers(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      users: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }

  // Get user by ID with related data
  static async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Budget,
          as: 'budgets',
          attributes: ['id', 'category', 'limit', 'startDate', 'endDate', 'created_at']
        },
        {
          model: Transaction,
          as: 'transactions',
          attributes: ['id', 'description', 'amount', 'category', 'type', 'date', 'created_at']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Create new user
  static async createUser(email, password, name, role = 'user') {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role
    });

    // Return user without password
    const userData = user.toJSON();
    delete userData.password;
    return userData;
  }

  // Update user
  static async updateUser(userId, updates) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update user
    await user.update(updates);

    // Return user without password
    const userData = user.toJSON();
    delete userData.password;
    return userData;
  }

  // Delete user
  static async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  // Get user statistics
  static async getUserStats(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const budgetCount = await Budget.count({ where: { userId } });
    const transactionCount = await Transaction.count({ where: { userId } });
    
    const totalBudgets = await Budget.sum('limit', { where: { userId } }) || 0;
    const totalExpenses = await Transaction.sum('amount', {
      where: {
        userId,
        type: 'expense'
      }
    }) || 0;
    const totalIncome = await Transaction.sum('amount', {
      where: {
        userId,
        type: 'income'
      }
    }) || 0;

    return {
      budgetCount,
      transactionCount,
      totalBudgets: parseFloat(totalBudgets),
      totalExpenses: parseFloat(totalExpenses),
      totalIncome: parseFloat(totalIncome),
      balance: parseFloat(totalIncome) - parseFloat(totalExpenses)
    };
  }

  // Calculate user streak (consecutive days with login activity)
  static async calculateUserStreak(userId) {
    const loginActivities = await UserActivity.findAll({
      where: {
        userId,
        activityType: 'login'
      },
      attributes: ['created_at'],
      order: [['created_at', 'DESC']],
      raw: true
    });

    if (loginActivities.length === 0) {
      return { currentStreak: 0, highestStreak: 0 };
    }

    // Get unique dates (only one login per day counts)
    const loginDates = new Set();
    loginActivities.forEach(activity => {
      const date = new Date(activity.created_at);
      date.setHours(0, 0, 0, 0);
      loginDates.add(date.toISOString().split('T')[0]);
    });

    const sortedDates = Array.from(loginDates).sort().reverse(); // Most recent first
    
    // Calculate current streak (from today or yesterday backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if user logged in today or yesterday
    let checkDate = new Date(today);
    if (!sortedDates.includes(todayStr)) {
      // If no login today, start from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Count consecutive days backwards
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate highest streak (all time)
    let highestStreak = 0;
    let tempStreak = 0;
    const sortedDatesAsc = Array.from(loginDates).sort(); // Oldest first
    
    for (let i = 0; i < sortedDatesAsc.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDatesAsc[i - 1]);
        const currDate = new Date(sortedDatesAsc[i]);
        const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          highestStreak = Math.max(highestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    highestStreak = Math.max(highestStreak, tempStreak);

    return { currentStreak, highestStreak };
  }

  // Get all users with streaks (excluding admins)
  static async getUsersWithStreaks() {
    const users = await User.findAll({
      where: { role: 'user' }, // Only get regular users, exclude admins
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    const usersWithStreaks = await Promise.all(
      users.map(async (user) => {
        const streaks = await this.calculateUserStreak(user.id);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          currentStreak: streaks.currentStreak,
          highestStreak: streaks.highestStreak
        };
      })
    );

    // Sort by current streak (highest first)
    usersWithStreaks.sort((a, b) => b.currentStreak - a.currentStreak);

    return usersWithStreaks;
  }

  // Get monthly registration data
  static async getMonthlyRegistrations() {
    const users = await User.findAll({
      attributes: ['created_at'],
      order: [['created_at', 'ASC']],
      raw: true
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Initialize all 12 months with 0 count
    const monthlyData = [];
    for (let i = 0; i < 12; i++) {
      monthlyData.push({
        month: monthNames[i],
        monthIndex: i,
        count: 0
      });
    }

    // Count registrations for current year
    users.forEach(user => {
      const date = new Date(user.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Only count registrations from current year
      if (year === currentYear) {
        monthlyData[month].count++;
      }
    });

    return monthlyData;
  }

  // Get expense category breakdown across all users
  static async getExpenseCategoryBreakdown() {
    const expenses = await Transaction.findAll({
      where: { type: 'expense' },
      attributes: ['category', 'amount'],
      raw: true
    });

    const categoryBreakdown = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = 0;
      }
      categoryBreakdown[category] += parseFloat(expense.amount || 0);
    });

    // Convert to array and sort by amount (descending)
    const sortedBreakdown = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({ category, amount: parseFloat(amount) }))
      .sort((a, b) => b.amount - a.amount);

    return sortedBreakdown;
  }

  // Get system-wide statistics
  static async getSystemStats() {
    // Only count regular users (exclude admins)
    const totalUsers = await User.count({ where: { role: 'user' } });

    // Get all regular user IDs (excluding admins)
    const regularUserIds = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'name', 'email'],
      raw: true
    });
    const userIds = regularUserIds.map(u => u.id);

    // Calculate total active sessions (excluding admin sessions)
    const totalActiveSessions = userIds.length > 0 
      ? await Session.count({
          where: {
            userId: { [Op.in]: userIds },
            isActive: true,
            expiresAt: { [Op.gt]: new Date() }
          }
        })
      : 0;

    // Get sessions per user breakdown (for debugging/transparency)
    const sessionsPerUser = userIds.length > 0
      ? await Session.findAll({
          where: {
            userId: { [Op.in]: userIds },
            isActive: true,
            expiresAt: { [Op.gt]: new Date() }
          },
          attributes: ['userId'],
          raw: true
        })
      : [];

    // Count sessions per user
    const userSessionCounts = {};
    sessionsPerUser.forEach(session => {
      userSessionCounts[session.userId] = (userSessionCounts[session.userId] || 0) + 1;
    });

    // Create breakdown with user names
    const sessionsBreakdown = regularUserIds.map(user => ({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      sessionCount: userSessionCounts[user.id] || 0
    })).filter(u => u.sessionCount > 0);

    // Get users with streaks
    const usersWithStreaks = await this.getUsersWithStreaks();
    
    // Get monthly registrations
    const monthlyRegistrations = await this.getMonthlyRegistrations();
    
    // Get expense category breakdown
    const expenseCategoryBreakdown = await this.getExpenseCategoryBreakdown();

    return {
      totalUsers,
      totalActiveSessions,
      sessionsBreakdown, // Breakdown of sessions per user
      usersWithStreaks,
      monthlyRegistrations,
      expenseCategoryBreakdown
    };
  }
}

module.exports = AdminService;
