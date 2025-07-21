import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

import { initializeDatabase } from './database';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './api';
import { setupSocketHandlers } from './game/socket';
import { GameWorld } from './game/world';
import { logger } from './services/logging';
import { config } from './config';
import { startGameLoop } from './game/gameLoop';
import { CacheService } from './services/cache';
import { QueueService } from './services/queue';
import { MonitoringService } from './services/monitoring';
import { AuthService } from './services/auth';
import { initializeGameSystems } from './game/systems';

async function startServer() {
  try {
    logger.info('Starting Epic MMORPG Server...');

    // Initialize database connections
    await initializeDatabase();
    logger.info('Database initialized');

    // Initialize Redis
    const pubClient = new Redis(config.redis);
    const subClient = pubClient.duplicate();
    logger.info('Redis connected');

    // Initialize Express app
    const app = express();
    const server = createServer(app);

    // Setup middleware
    app.use(helmet());
    app.use(cors(config.cors));
    app.use(compression());
    app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    setupMiddleware(app);
    logger.info('Middleware configured');

    // Setup API routes
    setupRoutes(app);
    logger.info('API routes configured');

    // Initialize Socket.IO with Redis adapter
    const io = new SocketServer(server, {
      cors: config.cors,
      adapter: createAdapter(pubClient, subClient),
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
    });

    // Initialize services
    const cache = new CacheService(pubClient);
    const queue = new QueueService();
    const monitoring = new MonitoringService();
    const auth = new AuthService();

    await cache.initialize();
    await queue.initialize();
    await monitoring.initialize();
    logger.info('Services initialized');

    // Initialize game world
    const gameWorld = new GameWorld({
      io,
      cache,
      queue,
      monitoring,
    });

    await gameWorld.initialize();
    logger.info('Game world initialized');

    // Setup socket handlers
    setupSocketHandlers(io, gameWorld, auth);
    logger.info('Socket handlers configured');

    // Initialize game systems
    await initializeGameSystems(gameWorld);
    logger.info('Game systems initialized');

    // Start game loop
    startGameLoop(gameWorld);
    logger.info('Game loop started');

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: config.version,
        players: gameWorld.getPlayerCount(),
        memory: process.memoryUsage(),
      });
    });

    // Start server
    const PORT = config.server.port;
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Version: ${config.version}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      
      server.close(() => {
        logger.info('HTTP server closed');
      });

      await gameWorld.shutdown();
      await queue.shutdown();
      await cache.shutdown();
      await monitoring.shutdown();
      
      pubClient.disconnect();
      subClient.disconnect();
      
      process.exit(0);
    });

    // Error handling
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      monitoring.recordError(error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      monitoring.recordError(new Error(String(reason)));
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { startServer };