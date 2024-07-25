"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeakyBucketRateLimiter = void 0;
const String_1 = require("../TSRedisCacheKit/String");
class LeakyBucketRateLimiter extends String_1.CacheString {
    constructor(redisConfig, capacity = 100, leakRate = 10) {
        super(redisConfig.prefix, redisConfig.option, redisConfig.redisClient);
        this.capacity = capacity;
        this.leakRate = leakRate;
    }
    async getBucketState(key) {
        const state = await this.redis.hgetall(this.createKey(key));
        return {
            tokens: state.tokens ? parseInt(state.tokens) : 0,
            lastLeakTime: state.lastLeakTime ? parseInt(state.lastLeakTime) : Date.now()
        };
    }
    async setBucketState(key, tokens, lastLeakTime) {
        await this.redis.hmset(this.createKey(key), { tokens: tokens.toString(), lastLeakTime: lastLeakTime.toString() });
    }
    async leakTokens(key) {
        const state = await this.getBucketState(key);
        const currentTime = Date.now();
        const timeElapsed = (currentTime - state.lastLeakTime) / 1000;
        const leakedTokens = Math.max(0, Math.floor(timeElapsed * this.leakRate));
        const newTokens = Math.max(0, state.tokens - leakedTokens);
        await this.setBucketState(key, newTokens, currentTime);
    }
    async isRateLimited(key) {
        await this.leakTokens(key);
        const state = await this.getBucketState(key);
        if (state.tokens < this.capacity) {
            await this.setBucketState(key, state.tokens + 1, state.lastLeakTime);
            return { status: false };
        }
        else {
            return { status: true };
        }
    }
}
exports.LeakyBucketRateLimiter = LeakyBucketRateLimiter;
