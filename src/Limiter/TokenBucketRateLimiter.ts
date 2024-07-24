import { CacheString } from "../TSRedisCacheKit/String";
import { RedisConfig } from "../type";

export class TokenBucketRateLimiter extends CacheString {
  maxTokens: number;
  refillRate: number;

  constructor(
    redisConfig: RedisConfig,
    maxTokens: number = 100,
    refillRate: number = 10
  ) {
    super(redisConfig.prefix, redisConfig.option, redisConfig.redisClient);
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
  }

  async getTokens(key: string): Promise<number> {
    const tokens = await this.redis.get(this.createKey(key));
    return tokens ? parseInt(tokens) : this.maxTokens;
  }

  async setTokens(key: string, tokens: number): Promise<void> {
    await this.redis.set(this.createKey(key), tokens.toString());
  }

  async refillTokens(key: string, lastRefillTime: number): Promise<void> {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - lastRefillTime) / 1000;
    const newTokens = Math.min(
      this.maxTokens,
      Math.floor(timeElapsed * this.refillRate)
    );
    await this.setTokens(key, newTokens);
  }

  async isRateLimited(key: string): Promise<{ status: boolean }> {
    const tokens = await this.getTokens(key);
    if (tokens > 0) {
      await this.setTokens(key, tokens - 1);
      return { status: false };
    } else {
      return { status: true };
    }
  }
}
