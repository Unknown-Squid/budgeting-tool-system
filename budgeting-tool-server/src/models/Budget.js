const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/dbConfig");

const Budget = sequelize.define(
  "Budget",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: "Primary key, unique identifier",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Foreign key referencing users table",
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Budget category name",
    },
    limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Budget limit amount",
    },
    period: {
      type: DataTypes.ENUM("monthly", "weekly", "yearly"),
      allowNull: false,
      defaultValue: "monthly",
      comment: "Budget period type",
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Number of periods (e.g., 1 week, 2 weeks, 1 month)",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Budget start date",
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Budget end date",
    },
  },
  {
    tableName: "budgets",
    timestamps: true,
    freezeTableName: true,
    underscored: true,
  }
);

// Associations will be defined in models/index.js to avoid circular dependencies

module.exports = Budget;
