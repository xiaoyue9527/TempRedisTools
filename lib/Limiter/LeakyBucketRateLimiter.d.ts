import { CacheString } from "../TSRedisCacheKit/String";
import { RedisConfig } from "../type";
export declare class LeakyBucketRateLimiter extends CacheString {
    capacity: number;
    leakRate: number;
    constructor(redisConfig: RedisConfig, capacity?: number, leakRate?: number);
    getBucketState(key: string): Promise<{
        tokens: number;
        lastLeakTime: number;
    }>;
    setBucketState(key: string, tokens: number, lastLeakTime: number): Promise<void>;
    leakTokens(key: string): Promise<void>;
    isRateLimited(key: string): Promise<{
        status: boolean;
    }>;
}
