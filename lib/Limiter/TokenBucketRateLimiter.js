"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBucketRateLimiter = void 0;
const String_1 = require("../TSRedisCacheKit/String");
class TokenBucketRateLimiter extends String_1.CacheString {
    constructor(redisConfig, maxTokens = 100, refillRate = 10) {
        super(redisConfig.prefix, redisConfig.option, redisConfig.redisClient);
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
    }
    async getTokens(key) {
        const tokens = await this.redis.get(this.createKey(key));
        return tokens ? parseInt(tokens) : this.maxTokens;
    }
    async setTokens(key, tokens) {
        await this.redis.set(this.createKey(key), tokens.toString());
    }
    async refillTokens(key, lastRefillTime) {
        const currentTime = Date.now();
        const timeElapsed = (currentTime - lastRefillTime) / 1000;
        const newTokens = Math.min(this.maxTokens, Math.floor(timeElapsed * this.refillRate));
        await this.setTokens(key, newTokens);
    }
    async isRateLimited(key) {
        const tokens = await this.getTokens(key);
        if (tokens > 0) {
            await this.setTokens(key, tokens - 1);
            return { status: false };
        }
        else {
            return { status: true };
        }
    }
}
exports.TokenBucketRateLimiter = TokenBucketRateLimiter;
