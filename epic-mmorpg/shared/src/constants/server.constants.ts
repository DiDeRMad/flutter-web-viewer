export const SERVER_PORT = process.env.PORT || 3000;
export const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

export const DB_CONNECTION_LIMIT = 20;
export const REDIS_TTL = 3600; // 1 hour

export const JWT_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY = '30d';

export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 100;

export const MAX_CONCURRENT_CONNECTIONS = 10000;
export const HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes