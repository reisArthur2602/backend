import redisConfig from "../../config/redis-config.js";
import Redis from "ioredis";

class RedisCache {
  private client: Redis.Redis;

  constructor() {
    this.client = new Redis.default(redisConfig);
  }

  public async save(input: { key: string; value: any }) {
    await this.client.set(input.key, JSON.stringify(input.value));
  }
  
  public async recover<T>(input: { key: string }): Promise<T | null> {
    const data = await this.client.get(input.key);
    if (!data) return null;

    const json = JSON.parse(data) as T;
    return json;
  }

  public async invalidate<T>(input: { key: string }) {
    await this.client.del(input.key);
  }
}

export default RedisCache;
