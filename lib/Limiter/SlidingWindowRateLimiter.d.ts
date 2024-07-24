import { CacheSortedSet } from "../TSRedisCacheKit/SortedSet";
import { RedisConfig } from "../type";
/**
 * 滑动窗口限流器
 */
export declare class SlidingWindowRateLimiter extends CacheSortedSet {
    windowSize: number;
    limit: number;
    initialTime: number;
    sortedSetLength: number;
    /**
     * 创建一个滑动窗口限流器实例
     * @param redisConfig Redis 配置
     * @param windowSize 窗口大小，默认为 10 秒
     * @param limit 限制值，默认为 10
     * @param initialTime 分数差，默认为 1600000000000
     */
    constructor(redisConfig: RedisConfig, windowSize?: number, limit?: number, initialTime?: number, sortedSetLength?: number);
    handleSortedSetLength(key: string, currentTime: number): Promise<void>;
    push(key: string, value?: number): Promise<boolean>;
    /**
     * 检查给定键的请求是否受到限流
     * @param key 键
     * @param limit 可选的限制值，用于覆盖实例的默认限制值
     * @returns 返回一个包含状态信息的 Promise 对象
     */
    isRateLimited(key: string, limit?: number): Promise<{
        status: boolean;
        msg?: string;
        limit?: number;
        current?: number;
    }>;
}
