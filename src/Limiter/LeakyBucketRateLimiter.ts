import { CacheString } from "../TSRedisCacheKit/String";
import { RedisConfig } from "../type";


export class LeakyBucketRateLimiter extends CacheString {
  capacity: number;
  leakRate: number;

  constructor(redisConfig: RedisConfig, capacity: number = 100, leakRate: number = 10) {
    super(redisConfig.prefix, redisConfig.option, redisConfig.redisClient);
    this.capacity = capacity;
    this.leakRate = leakRate;
  }

  async getBucketState(key: string): Promise<{ tokens: number, lastLeakTime: number }> {
    const state = await this.redis.hgetall(this.createKey(key));
    return {
      tokens: state.tokens ? parseInt(state.tokens) : 0,
      lastLeakTime: state.lastLeakTime ? parseInt(state.lastLeakTime) : Date.now()
    };
  }

  async setBucketState(key: string, tokens: number, lastLeakTime: number): Promise<void> {
    await this.redis.hmset(this.createKey(key), { tokens: tokens.toString(), lastLeakTime: lastLeakTime.toString() });
  }

  async leakTokens(key: string): Promise<void> {
    const state = await this.getBucketState(key);
    const currentTime = Date.now();
    const timeElapsed = (currentTime - state.lastLeakTime) / 1000;
    const leakedTokens = Math.floor(timeElapsed * this.leakRate);
    const newTokens = Math.max(0, state.tokens - leakedTokens);
    await this.setBucketState(key, newTokens, currentTime);
  }

  async isRateLimited(key: string): Promise<{ status: boolean }> {
    await this.leakTokens(key);
    const state = await this.getBucketState(key);
    if (state.tokens < this.capacity) {
      await this.setBucketState(key, state.tokens + 1, state.lastLeakTime);
      return { status: false };
    } else {
      return { status: true };
    }
  }
}