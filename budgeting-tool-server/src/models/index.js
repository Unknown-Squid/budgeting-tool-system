const User = require('./User');
const Budget = require('./Budget');
const Transaction = require('./Transaction');
const Log = require('./Log');
const Session = require('./Session');
const UserActivity = require('./UserActivity');

// Define associations
Budget.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Budget, { foreignKey: "userId", as: "budgets" });

Transaction.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Transaction, { foreignKey: "userId", as: "transactions" });

Log.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Log, { foreignKey: "userId", as: "logs" });

Session.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Session, { foreignKey: "userId", as: "sessions" });

UserActivity.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(UserActivity, { foreignKey: "userId", as: "activities" });

module.exports = {
  User,
  Budget,
  Transaction,
  Log,
  Session,
  UserActivity,
};
