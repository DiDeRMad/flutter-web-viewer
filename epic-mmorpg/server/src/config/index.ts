import { SERVER_PORT, SOCKET_PORT } from '@epic-mmorpg/shared';

export const config = {
  env: process.env.NODE_ENV || 'development',
  version: '1.0.0',
  
  server: {
    port: parseInt(process.env.PORT || String(SERVER_PORT)),
    socketPort: parseInt(process.env.SOCKET_PORT || String(SOCKET_PORT)),
    host: process.env.HOST || '0.0.0.0',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'epic_mmorpg',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: 2,
      max: 20,
      idleTimeoutMillis: 30000,
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'mmorpg:',
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },

  game: {
    tickRate: parseInt(process.env.GAME_TICK_RATE || '20'), // 20 ticks per second
    saveInterval: parseInt(process.env.GAME_SAVE_INTERVAL || '300000'), // 5 minutes
    maxPlayersPerInstance: parseInt(process.env.MAX_PLAYERS_PER_INSTANCE || '100'),
    viewDistance: parseInt(process.env.VIEW_DISTANCE || '150'),
    combatLogRetention: parseInt(process.env.COMBAT_LOG_RETENTION || '3600000'), // 1 hour
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    directory: process.env.LOG_DIR || './logs',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '14'),
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },

  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    interval: parseInt(process.env.MONITORING_INTERVAL || '60000'), // 1 minute
    metrics: {
      cpu: true,
      memory: true,
      disk: true,
      network: true,
      game: true,
    },
  },

  queue: {
    redis: {
      host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT || '6379'),
      password: process.env.QUEUE_REDIS_PASSWORD || process.env.REDIS_PASSWORD,
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  },

  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    from: process.env.EMAIL_FROM || 'noreply@epicmmorpg.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  storage: {
    type: process.env.STORAGE_TYPE || 'local', // 'local' | 's3' | 'gcs'
    local: {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      publicDir: process.env.PUBLIC_DIR || './public',
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  },

  stripe: {
    enabled: process.env.STRIPE_ENABLED === 'true',
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: process.env.STRIPE_CURRENCY || 'usd',
  },

  discord: {
    enabled: process.env.DISCORD_ENABLED === 'true',
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    botToken: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
  },

  twitch: {
    enabled: process.env.TWITCH_ENABLED === 'true',
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
  },

  steam: {
    enabled: process.env.STEAM_ENABLED === 'true',
    apiKey: process.env.STEAM_API_KEY,
  },

  google: {
    enabled: process.env.GOOGLE_ENABLED === 'true',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  facebook: {
    enabled: process.env.FACEBOOK_ENABLED === 'true',
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },

  features: {
    registration: process.env.FEATURE_REGISTRATION !== 'false',
    trading: process.env.FEATURE_TRADING !== 'false',
    auction: process.env.FEATURE_AUCTION !== 'false',
    pvp: process.env.FEATURE_PVP !== 'false',
    guilds: process.env.FEATURE_GUILDS !== 'false',
    housing: process.env.FEATURE_HOUSING !== 'false',
    crafting: process.env.FEATURE_CRAFTING !== 'false',
    achievements: process.env.FEATURE_ACHIEVEMENTS !== 'false',
    leaderboards: process.env.FEATURE_LEADERBOARDS !== 'false',
    events: process.env.FEATURE_EVENTS !== 'false',
    crossRealm: process.env.FEATURE_CROSS_REALM !== 'false',
  },

  maintenance: {
    enabled: process.env.MAINTENANCE_MODE === 'true',
    message: process.env.MAINTENANCE_MESSAGE || 'Server is under maintenance. Please try again later.',
    allowedIPs: process.env.MAINTENANCE_ALLOWED_IPS?.split(',') || [],
  },
};