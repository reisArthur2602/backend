type RedisConfig = {
  host?: string | undefined;
  port?: number;
};

const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export default redisConfig;
