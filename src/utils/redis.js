import { createClient } from 'redis';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
  enable_offline_queue: false,
});

redisClient.connect();

export default redisClient; 