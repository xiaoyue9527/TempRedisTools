"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RedisLock {
    /**
     * 构造函数
     * @param {Redis} client - Redis 客户端实例
     * @param {string} lockKey - 锁的键名
     * @param {number} [ttl=30000] - 锁的生存时间（毫秒），默认30秒
     */
    constructor(client, lockKey, ttl = 30000) {
        this.client = client;
        this.lockKey = lockKey;
        this.lockValue = Math.random().toString(36).slice(2); // 生成一个随机的唯一标识符
        this.ttl = ttl;
    }
    /**
     * 尝试获取锁，带有可选的自动重试机制
     * @param {number} [retryDelay=100] - 重试间隔时间（毫秒），默认100毫秒
     * @param {number} [maxRetries=10] - 最大重试次数，默认10次
     * @returns {Promise<boolean>} 是否成功获取锁
     */
    async acquire(retryDelay = 100, maxRetries = 10) {
        let retries = 0;
        while (maxRetries < 0 || retries < maxRetries) {
            const result = await this.client.set(this.lockKey, this.lockValue, "PX", this.ttl, "NX");
            if (result === "OK") {
                return true; // 成功获取锁
            }
            retries++;
            await this.delay(retryDelay); // 等待一段时间后重试
        }
        return false; // 超过最大重试次数，获取锁失败
    }
    /**
     * 释放锁
     * @returns {Promise<boolean>} 是否成功释放锁
     */
    async release() {
        // Lua 脚本，确保只有持有锁的进程才能释放锁
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        // 执行 Lua 脚本，传入锁的键和唯一标识符
        const result = await this.client.eval(script, 1, this.lockKey, this.lockValue);
        return result === 1; // 返回是否成功释放锁
    }
    /**
     * 延迟函数，用于等待一段时间
     * @param {number} ms - 等待的时间（毫秒）
     * @returns {Promise<void>} 在指定时间后解析的 Promise
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.default = RedisLock;
