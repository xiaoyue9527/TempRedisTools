import { Redis } from "ioredis";
declare class RedisLock {
    private client;
    private lockKey;
    private lockValue;
    private ttl;
    /**
     * 构造函数
     * @param {Redis} client - Redis 客户端实例
     * @param {string} lockKey - 锁的键名
     * @param {number} [ttl=30000] - 锁的生存时间（毫秒），默认30秒
     */
    constructor(client: Redis, lockKey: string, ttl?: number);
    /**
     * 尝试获取锁，带有可选的自动重试机制
     * @param {number} [retryDelay=100] - 重试间隔时间（毫秒），默认100毫秒
     * @param {number} [maxRetries=10] - 最大重试次数，默认10次
     * @returns {Promise<boolean>} 是否成功获取锁
     */
    acquire(retryDelay?: number, maxRetries?: number): Promise<boolean>;
    /**
     * 释放锁
     * @returns {Promise<boolean>} 是否成功释放锁
     */
    release(): Promise<boolean>;
    /**
     * 延迟函数，用于等待一段时间
     * @param {number} ms - 等待的时间（毫秒）
     * @returns {Promise<void>} 在指定时间后解析的 Promise
     */
    private delay;
}
export default RedisLock;
