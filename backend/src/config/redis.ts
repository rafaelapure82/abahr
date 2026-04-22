import Redis from 'ioredis';
import { logger } from './logger';
import { env } from './env';

const redisUrl = env.REDIS_URL || 'redis://localhost:6380';

export function createRedisClient() {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

const redis = createRedisClient();

redis.on('connect', () => {
  logger.info('🚀 Connected to Redis');
});

redis.on('error', (err) => {
  logger.error('❌ Redis connection error:', err);
});

export default redis;
