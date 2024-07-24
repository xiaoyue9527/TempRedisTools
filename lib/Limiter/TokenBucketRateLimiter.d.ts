import { CacheString } from "../TSRedisCacheKit/String";
import { RedisConfig } from "../type";
export declare class TokenBucketRateLimiter extends CacheString {
    maxTokens: number;
    refillRate: number;
    constructor(redisConfig: RedisConfig, maxTokens?: number, refillRate?: number);
    getTokens(key: string): Promise<number>;
    setTokens(key: string, tokens: number): Promise<void>;
    refillTokens(key: string, lastRefillTime: number): Promise<void>;
    isRateLimited(key: string): Promise<{
        status: boolean;
    }>;
}
