import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '@/config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport for development
if (config.nodeEnv === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: config.analytics.logLevel,
    })
  );
}

// File transports for all environments
transports.push(
  // Error logs
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '20m',
    maxFiles: `${config.analytics.logRetentionDays}d`,
    zippedArchive: true,
  }),

  // Combined logs
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '20m',
    maxFiles: `${config.analytics.logRetentionDays}d`,
    zippedArchive: true,
    level: config.analytics.logLevel,
  }),

  // Game-specific logs
  new DailyRotateFile({
    filename: 'logs/game-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '50m',
    maxFiles: `${config.analytics.logRetentionDays}d`,
    zippedArchive: true,
    level: 'info',
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.analytics.logLevel,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Custom logging functions with context
export const gameLogger = {
  info: (message: string, meta?: any) => logger.info(message, { context: 'GAME', ...meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { context: 'GAME', ...meta }),
  error: (message: string, meta?: any) => logger.error(message, { context: 'GAME', ...meta }),
  debug: (message: string, meta?: any) => logger.debug(message, { context: 'GAME', ...meta }),
};

export const authLogger = {
  info: (message: string, meta?: any) => logger.info(message, { context: 'AUTH', ...meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { context: 'AUTH', ...meta }),
  error: (message: string, meta?: any) => logger.error(message, { context: 'AUTH', ...meta }),
  debug: (message: string, meta?: any) => logger.debug(message, { context: 'AUTH', ...meta }),
};

export const apiLogger = {
  info: (message: string, meta?: any) => logger.info(message, { context: 'API', ...meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { context: 'API', ...meta }),
  error: (message: string, meta?: any) => logger.error(message, { context: 'API', ...meta }),
  debug: (message: string, meta?: any) => logger.debug(message, { context: 'API', ...meta }),
};

export const wsLogger = {
  info: (message: string, meta?: any) => logger.info(message, { context: 'WEBSOCKET', ...meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { context: 'WEBSOCKET', ...meta }),
  error: (message: string, meta?: any) => logger.error(message, { context: 'WEBSOCKET', ...meta }),
  debug: (message: string, meta?: any) => logger.debug(message, { context: 'WEBSOCKET', ...meta }),
};

export const dbLogger = {
  info: (message: string, meta?: any) => logger.info(message, { context: 'DATABASE', ...meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { context: 'DATABASE', ...meta }),
  error: (message: string, meta?: any) => logger.error(message, { context: 'DATABASE', ...meta }),
  debug: (message: string, meta?: any) => logger.debug(message, { context: 'DATABASE', ...meta }),
};

// Performance monitoring helpers
export const performanceLogger = {
  startTimer: (label: string) => {
    const start = Date.now();
    return {
      end: (meta?: any) => {
        const duration = Date.now() - start;
        logger.info(`Performance: ${label}`, {
          context: 'PERFORMANCE',
          duration,
          label,
          ...meta,
        });
        return duration;
      },
    };
  },

  logSlowQuery: (query: string, duration: number, meta?: any) => {
    if (duration > 1000) { // Log queries slower than 1 second
      logger.warn('Slow database query detected', {
        context: 'PERFORMANCE',
        query,
        duration,
        ...meta,
      });
    }
  },

  logMemoryUsage: () => {
    const usage = process.memoryUsage();
    logger.info('Memory usage', {
      context: 'PERFORMANCE',
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    });
  },
};

// Security event logging
export const securityLogger = {
  loginAttempt: (username: string, ip: string, success: boolean, meta?: any) => {
    logger.info(`Login attempt: ${success ? 'SUCCESS' : 'FAILED'}`, {
      context: 'SECURITY',
      username,
      ip,
      success,
      ...meta,
    });
  },

  suspiciousActivity: (userId: string, activity: string, meta?: any) => {
    logger.warn('Suspicious activity detected', {
      context: 'SECURITY',
      userId,
      activity,
      ...meta,
    });
  },

  antiCheatViolation: (playerId: string, violation: string, meta?: any) => {
    logger.error('Anti-cheat violation', {
      context: 'ANTI_CHEAT',
      playerId,
      violation,
      ...meta,
    });
  },

  rateLimitExceeded: (ip: string, endpoint: string, meta?: any) => {
    logger.warn('Rate limit exceeded', {
      context: 'SECURITY',
      ip,
      endpoint,
      ...meta,
    });
  },
};

// Game event logging
export const gameEventLogger = {
  matchStart: (matchId: string, gameMode: string, playerCount: number, meta?: any) => {
    logger.info('Match started', {
      context: 'GAME_EVENT',
      matchId,
      gameMode,
      playerCount,
      ...meta,
    });
  },

  matchEnd: (matchId: string, duration: number, winner: string, meta?: any) => {
    logger.info('Match ended', {
      context: 'GAME_EVENT',
      matchId,
      duration,
      winner,
      ...meta,
    });
  },

  playerAction: (playerId: string, action: string, matchId?: string, meta?: any) => {
    logger.debug('Player action', {
      context: 'GAME_EVENT',
      playerId,
      action,
      matchId,
      ...meta,
    });
  },

  achievementUnlocked: (playerId: string, achievementId: string, meta?: any) => {
    logger.info('Achievement unlocked', {
      context: 'GAME_EVENT',
      playerId,
      achievementId,
      ...meta,
    });
  },
};

// HTTP request logging middleware
export const httpLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: `${config.analytics.logRetentionDays}d`,
      zippedArchive: true,
    }),
  ],
});

export default logger;