const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/dbConfig");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: "Primary key, unique identifier",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      comment: "User email address",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Hashed password",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "User full name",
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
      comment: "User role: 'user' or 'admin'",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    freezeTableName: true,
    underscored: true,
  }
);

module.exports = User;
