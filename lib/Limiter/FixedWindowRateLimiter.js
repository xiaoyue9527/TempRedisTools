"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedWindowRateLimiter = void 0;
const String_1 = require("../TSRedisCacheKit/String");
/**
 * 固定窗口限流器
 */
class FixedWindowRateLimiter extends String_1.CacheString {
    /**
     * 创建一个固定窗口限流器实例
     * @param redisConfig Redis 配置
     * @param windowSize 窗口大小，默认为 10 秒
     * @param limit 限制值，默认为 10
     */
    constructor(redisConfig, windowSize = 10, limit = 10) {
        super(redisConfig.prefix, redisConfig.option, redisConfig.redisClient);
        this.windowSize = windowSize;
        this.limit = limit;
    }
    /**
     * 检查给定键的请求是否受到限流
     * @param key 键
     * @param limit 可选的限制值，用于覆盖实例的默认限制值
     * @returns 返回一个包含状态信息的 Promise 对象
     */
    async isRateLimited(key, limit) {
        const currentCount = await this.redis.incr(this.createKey(key));
        if (currentCount === 1) {
            // 当前窗口开始，设置过期时间
            await this.redis.expire(this.createKey(key), this.windowSize);
        }
        const size = limit || this.limit;
        if (currentCount > size) {
            // 超过限制
            return {
                status: true,
            };
        }
        return {
            status: false,
        };
    }
}
exports.FixedWindowRateLimiter = FixedWindowRateLimiter;
