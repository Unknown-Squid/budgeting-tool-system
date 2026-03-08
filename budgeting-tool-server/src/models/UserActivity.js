const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/dbConfig");

const UserActivity = sequelize.define(
  "UserActivity",
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
    activityType: {
      type: DataTypes.ENUM('login', 'logout', 'session_refresh', 'api_call'),
      allowNull: false,
      defaultValue: 'login',
      comment: "Type of activity: login, logout, session_refresh, api_call",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "IP address from which the activity occurred",
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "User agent string of the client",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional metadata about the activity",
    },
  },
  {
    tableName: "user_activities",
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "activity_type"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["user_id", "created_at"],
      },
    ],
  }
);

module.exports = UserActivity;
