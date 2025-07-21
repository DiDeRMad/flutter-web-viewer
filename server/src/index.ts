import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

import config from '@/config';
import logger, { httpLogger, apiLogger, performanceLogger } from '@/utils/logger';
import { initializeDatabase } from '@/models';
import { initializeRedis } from '@/services/redis';
import { setupWebSocketHandlers } from '@/websocket';
import { setupRoutes } from '@/controllers';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';
import { GameEngine } from '@/game/engine';
import { MatchmakingService } from '@/services/matchmaking';
import { ChatService } from '@/services/chat';
import { AntiCheatService } from '@/services/antiCheat';

// Create Express app
const app = express();
const server = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: config.nodeEnv === 'production' ? false : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6, // 1MB
});

// Global services
let gameEngine: GameEngine;
let matchmakingService: MatchmakingService;
let chatService: ChatService;
let antiCheatService: AntiCheatService;

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// HTTP request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpLogger.info('HTTP Request', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      referer: req.get('Referer'),
    });
  });
  
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.nodeEnv === 'production' ? 
    ['https://epic-battle-arena.com', 'https://www.epic-battle-arena.com'] : 
    true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindow * 60 * 1000, // Convert to milliseconds
  max: config.security.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: config.security.rateLimitWindow * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      endpoint: req.path,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected', // TODO: Add actual health checks
      redis: 'connected',
      gameEngine: gameEngine ? 'running' : 'stopped',
    },
  };
  
  res.status(200).json(healthCheck);
});

// Metrics endpoint for monitoring
app.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    activeConnections: io.engine.clientsCount,
    activeMatches: gameEngine ? gameEngine.getActiveMatchesCount() : 0,
    queuedPlayers: matchmakingService ? matchmakingService.getQueueSize() : 0,
  };
  
  res.status(200).json(metrics);
});

// API routes
setupRoutes(app);

// Static file serving
app.use('/uploads', express.static(config.upload.uploadPath));

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    apiLogger.info('Initializing services...');
    
    // Initialize database
    await initializeDatabase();
    apiLogger.info('Database initialized');
    
    // Initialize Redis
    await initializeRedis();
    apiLogger.info('Redis initialized');
    
    // Initialize game services
    gameEngine = new GameEngine();
    await gameEngine.initialize();
    apiLogger.info('Game engine initialized');
    
    matchmakingService = new MatchmakingService(gameEngine);
    await matchmakingService.initialize();
    apiLogger.info('Matchmaking service initialized');
    
    chatService = new ChatService();
    await chatService.initialize();
    apiLogger.info('Chat service initialized');
    
    if (config.antiCheat.enabled) {
      antiCheatService = new AntiCheatService();
      await antiCheatService.initialize();
      apiLogger.info('Anti-cheat service initialized');
    }
    
    // Setup WebSocket handlers
    setupWebSocketHandlers(io, {
      gameEngine,
      matchmakingService,
      chatService,
      antiCheatService,
    });
    apiLogger.info('WebSocket handlers initialized');
    
    apiLogger.info('All services initialized successfully');
  } catch (error) {
    apiLogger.error('Failed to initialize services', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    // Disconnect all Socket.IO clients
    io.close(() => {
      logger.info('WebSocket server closed');
    });
    
    // Shutdown game services
    if (gameEngine) {
      await gameEngine.shutdown();
      logger.info('Game engine shutdown complete');
    }
    
    if (matchmakingService) {
      await matchmakingService.shutdown();
      logger.info('Matchmaking service shutdown complete');
    }
    
    if (chatService) {
      await chatService.shutdown();
      logger.info('Chat service shutdown complete');
    }
    
    if (antiCheatService) {
      await antiCheatService.shutdown();
      logger.info('Anti-cheat service shutdown complete');
    }
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Performance monitoring
if (config.analytics.enabled) {
  setInterval(() => {
    performanceLogger.logMemoryUsage();
  }, 60000); // Log memory usage every minute
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    server.listen(config.port, config.host, () => {
      logger.info(`🎮 Epic Battle Arena Server started successfully!`, {
        port: config.port,
        host: config.host,
        environment: config.nodeEnv,
        processId: process.pid,
      });
      
      logger.info(`🌐 Server accessible at http://${config.host}:${config.port}`);
      logger.info(`📊 Health check: http://${config.host}:${config.port}/health`);
      logger.info(`📈 Metrics: http://${config.host}:${config.port}/metrics`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Global error handlers
process.on('warning', (warning) => {
  logger.warn('Process warning', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
  });
});

// Start the server
startServer();

// Export for testing
export { app, server, io };
export { gameEngine, matchmakingService, chatService, antiCheatService };