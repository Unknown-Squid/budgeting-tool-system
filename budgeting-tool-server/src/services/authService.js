const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const Session = require('../models/Session');
const UserActivity = require('../models/UserActivity');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'; // 7 days

class AuthService {
  static async register(email, password, name, ipAddress, userAgent) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // Create session with tokens
    const { accessToken, refreshToken, session } = await this.createSession(user, ipAddress, userAgent);
    
    // Log user activity (registration/login)
    await this.logUserActivity(user.id, 'login', ipAddress, userAgent);
    
    return { 
      accessToken, 
      refreshToken, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' } 
    };
  }

  static async login(email, password, ipAddress, userAgent) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Invalidate all existing active sessions for this user (logout from all devices)
    // This ensures each login creates a fresh session and prevents multiple active sessions
    await Session.update(
      { isActive: false },
      { 
        where: { 
          userId: user.id, 
          isActive: true 
        } 
      }
    );

    // Create new session with tokens
    const { accessToken, refreshToken, session } = await this.createSession(user, ipAddress, userAgent);
    
    // Log user activity (login)
    await this.logUserActivity(user.id, 'login', ipAddress, userAgent, { sessionId: session.id });
    
    return { 
      accessToken, 
      refreshToken, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' } 
    };
  }

  static async createSession(user, ipAddress, userAgent) {
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Create session in database
    const session = await Session.create({
      userId: user.id,
      refreshToken: this.hashToken(refreshToken),
      accessToken: this.hashToken(accessToken),
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true,
      lastUsedAt: new Date(),
    });

    return { accessToken, refreshToken, session };
  }

  static async refreshAccessToken(refreshToken, ipAddress, userAgent) {
    // Find session by refresh token
    const hashedToken = this.hashToken(refreshToken);
    const session = await Session.findOne({
      where: { 
        refreshToken: hashedToken,
        isActive: true 
      },
      include: [{ model: User, as: 'user' }]
    });

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      throw new Error('Refresh token expired');
    }

    // Check if user still exists
    if (!session.user) {
      session.isActive = false;
      await session.save();
      throw new Error('User not found');
    }

    // Update session metadata
    session.lastUsedAt = new Date();
    if (ipAddress) session.ipAddress = ipAddress;
    if (userAgent) session.userAgent = userAgent;
    await session.save();

    // Generate new access token
    const accessToken = this.generateAccessToken(session.user);

    // Update access token in session
    session.accessToken = this.hashToken(accessToken);
    await session.save();

    return { accessToken };
  }

  static async logout(refreshToken) {
    const hashedToken = this.hashToken(refreshToken);
    const session = await Session.findOne({
      where: { refreshToken: hashedToken }
    });

    if (session) {
      // Mark session as inactive (destroy the session)
      session.isActive = false;
      await session.save();
      
      // Log user activity (logout)
      await this.logUserActivity(session.userId, 'logout', session.ipAddress, session.userAgent, { sessionId: session.id });
    }

    return { message: 'Logged out successfully' };
  }

  static async logoutAll(userId) {
    await Session.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );

    return { message: 'Logged out from all devices' };
  }

  static async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role || 'user' };
  }

  static async getActiveSessions(userId) {
    return await Session.findAll({
      where: { 
        userId, 
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['last_used_at', 'DESC']]
    });
  }

  static generateAccessToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role || 'user',
        type: 'access'
      }, 
      JWT_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  static generateRefreshToken() {
    // Generate a secure random token
    return crypto.randomBytes(64).toString('hex');
  }

  static hashToken(token) {
    // Hash token for storage (using SHA-256)
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (err) {
      throw new Error('Invalid or expired access token');
    }
  }

  static async validateSession(accessToken) {
    // Verify token (this checks JWT signature and expiration)
    const decoded = this.verifyAccessToken(accessToken);
    
    // Check if user has any active session (not requiring exact access token match since tokens refresh)
    const session = await Session.findOne({
      where: {
        userId: decoded.id,
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['last_used_at', 'DESC']]
    });

    if (!session) {
      throw new Error('Session not found or inactive');
    }

    // Update last used timestamp
    session.lastUsedAt = new Date();
    await session.save();

    return { decoded, session };
  }

  // Log user activity
  static async logUserActivity(userId, activityType, ipAddress, userAgent, metadata = {}) {
    try {
      await UserActivity.create({
        userId,
        activityType,
        ipAddress,
        userAgent,
        metadata
      });
    } catch (error) {
      // Don't throw error if logging fails - it's not critical
      console.error('Failed to log user activity:', error);
    }
  }

  // Cleanup expired sessions (can be called by a cron job)
  static async cleanupExpiredSessions() {
    const result = await Session.update(
      { isActive: false },
      {
        where: {
          expiresAt: { [Op.lt]: new Date() },
          isActive: true
        }
      }
    );
    return result;
  }
}

module.exports = AuthService;
