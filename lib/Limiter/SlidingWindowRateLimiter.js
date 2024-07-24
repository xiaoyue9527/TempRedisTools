"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlidingWindowRateLimiter = void 0;
const SortedSet_1 = require("../TSRedisCacheKit/SortedSet");
/**
 * 滑动窗口限流器
 */
class SlidingWindowRateLimiter extends SortedSet_1.CacheSortedSet {
    /**
     * 创建一个滑动窗口限流器实例
     * @param redisConfig Redis 配置
     * @param windowSize 窗口大小，默认为 10 秒
     * @param limit 限制值，默认为 10
     * @param initialTime 分数差，默认为 1600000000000
     */
    constructor(redisConfig, windowSize = 10, limit = 10, initialTime = 1690000000000, sortedSetLength = 60) {
        super(redisConfig.prefix, redisConfig.option, redisConfig.redisClient);
        this.windowSize = windowSize;
        this.limit = limit;
        this.initialTime = initialTime;
        this.sortedSetLength = sortedSetLength;
    }
    async handleSortedSetLength(key, currentTime) {
        const minTime = currentTime -
            1000 * (this.windowSize + this.sortedSetLength) -
            this.initialTime;
        // 删除比窗口早sortedSetLength的时间的数据
        const result = await this.redis.zremrangebyscore(this.createKey(key), 0, minTime);
        if (result) {
            console.log(`Sorted set length ${result}`, minTime);
        }
    }
    async push(key, value = Date.now()) {
        return await this.add(value - this.initialTime, value, key);
    }
    /**
     * 检查给定键的请求是否受到限流
     * @param key 键
     * @param limit 可选的限制值，用于覆盖实例的默认限制值
     * @returns 返回一个包含状态信息的 Promise 对象
     */
    async isRateLimited(key, limit) {
        const currentTime = Date.now(); // 当前时间，单位为秒
        await this.handleSortedSetLength(key, currentTime);
        const count = await this.redis.zcount(this.createKey(key), currentTime - 1000 * 60 * this.windowSize - this.initialTime, currentTime - this.initialTime);
        const size = limit || this.limit;
        if (count > size) {
            // 超过限制
            return {
                status: true,
                msg: `Limit exceeded unit ${this.windowSize} limit ${size} urrentSerial ${count}`,
            };
        }
        return {
            status: false,
            limit: size,
            current: count,
        };
    }
}
exports.SlidingWindowRateLimiter = SlidingWindowRateLimiter;
