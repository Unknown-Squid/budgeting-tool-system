const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/dbConfig");

const Session = sequelize.define(
  "Session",
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
    refreshToken: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      comment: "Refresh token for session",
    },
    accessToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Current access token (optional, for tracking)",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "IP address of the client",
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "User agent string of the client",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Refresh token expiration date",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Whether the session is active",
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Last time the session was used",
    },
  },
  {
    tableName: "sessions",
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["refresh_token"],
        unique: true,
      },
      {
        fields: ["expires_at"],
      },
    ],
  }
);

module.exports = Session;
