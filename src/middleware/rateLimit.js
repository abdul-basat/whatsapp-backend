import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';
import config from '../config/rateLimit.js';

// Create Redis client
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
  enable_offline_queue: false,
});

// Initialize rate limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limit',
  points: config.points, // Requests per window
  duration: config.duration, // Per second
  blockDuration: config.blockDuration, // Block for 1 hour if exceeded
});

// Middleware function
export const rateLimiterMiddleware = (req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  rateLimiter.consume(clientIP)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    });
};

export default rateLimiterMiddleware;
