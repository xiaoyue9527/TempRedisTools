import { CacheString } from "../TSRedisCacheKit/String";
import { RedisConfig } from "../type";

/**
 * 固定窗口限流器
 */
export class FixedWindowRateLimiter extends CacheString {
    windowSize: number; // 窗口大小，单位为秒
    limit: number; // 限制值，窗口内允许通过的最大请求数量
  
    /**
     * 创建一个固定窗口限流器实例
     * @param redisConfig Redis 配置
     * @param windowSize 窗口大小，默认为 10 秒
     * @param limit 限制值，默认为 10
     */
    constructor(
      redisConfig: RedisConfig,
      windowSize: number = 10,
      limit: number = 10
    ) {
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
    async isRateLimited(
      key: string,
      limit?: number
    ): Promise<{ status: boolean }> {
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