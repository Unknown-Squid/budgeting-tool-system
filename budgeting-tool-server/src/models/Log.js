const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/dbConfig");

const Log = sequelize.define(
  "Log",
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
    action: {
      type: DataTypes.ENUM("budget_created", "budget_updated", "budget_deleted", "transaction_created", "transaction_updated", "transaction_deleted", "report_generated"),
      allowNull: false,
      comment: "Type of action performed",
    },
    entityType: {
      type: DataTypes.ENUM("budget", "transaction", "report"),
      allowNull: false,
      comment: "Type of entity affected",
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the affected entity",
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Category of the budget or transaction",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Amount for transaction or budget limit",
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Description or details of the action",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional metadata about the action",
    },
  },
  {
    tableName: "logs",
    timestamps: true,
    freezeTableName: true,
    underscored: true,
  }
);

// Associations will be defined in models/index.js to avoid circular dependencies

module.exports = Log;
