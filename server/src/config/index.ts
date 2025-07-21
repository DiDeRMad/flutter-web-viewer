import dotenv from 'dotenv';
import { ServerConfig } from '@/types';

// Load environment variables
dotenv.config();

const config: ServerConfig = {
  // Server configuration
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'epic_battle_arena',
    user: process.env.DB_USER || 'game_user',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true',
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_change_this',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Game configuration
  game: {
    maxPlayersPerMatch: parseInt(process.env.MAX_PLAYERS_PER_MATCH || '100', 10),
    matchDuration: parseInt(process.env.MATCH_DURATION || '600', 10),
    lobbyTimeout: parseInt(process.env.LOBBY_TIMEOUT || '30', 10),
    tickRate: parseInt(process.env.TICK_RATE || '60', 10),
  },

  // Upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  // Email configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@epic-battle-arena.com',
  },

  // Analytics configuration
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '30', 10),
  },

  // Anti-cheat configuration
  antiCheat: {
    enabled: process.env.ANTI_CHEAT_ENABLED === 'true',
    maxMovementSpeed: parseInt(process.env.MAX_MOVEMENT_SPEED || '500', 10),
    maxActionsPerSecond: parseInt(process.env.MAX_ACTIONS_PER_SECOND || '10', 10),
  },
};

// Validate required configuration
const validateConfig = () => {
  const requiredVars = [
    'JWT_SECRET',
    'DB_PASSWORD',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please copy .env.example to .env and fill in the required values');
    process.exit(1);
  }
};

// Only validate in production
if (config.nodeEnv === 'production') {
  validateConfig();
}

export default config;