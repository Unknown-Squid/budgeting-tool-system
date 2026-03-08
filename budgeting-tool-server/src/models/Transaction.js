const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/dbConfig");

const Transaction = sequelize.define(
  "Transaction",
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
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Transaction description",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Transaction amount",
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Transaction category",
    },
    type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
      comment: "Transaction type",
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Transaction date",
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    freezeTableName: true,
    underscored: true,
  }
);

// Associations will be defined in models/index.js to avoid circular dependencies

module.exports = Transaction;
