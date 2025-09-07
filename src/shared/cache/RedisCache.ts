import redisConfig from '../../config/redis-config.js';
import Redis from 'ioredis';

export interface IRedisCache {
  save(data: { key: string; value: any }): Promise<void>;
  recover<T>(data: { key: string }): Promise<T | null>;
  invalidate(data: { key: string }): Promise<void>;
}

class RedisCache implements IRedisCache {
  private client: Redis.Redis;

  constructor() {
    this.client = new Redis.default(redisConfig);
  }

  public async save(data: { key: string; value: any }) {
    await this.client.set(data.key, JSON.stringify(data.value));
  }

  public async recover<T>(data: { key: string }): Promise<T | null> {
    const result = await this.client.get(data.key);
    if (!result) return null;

    const json = JSON.parse(result) as T;
    return json;
  }

  public async invalidate(input: { key: string }) {
    await this.client.del(input.key);
  }
}

export default RedisCache;
