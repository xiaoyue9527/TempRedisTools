import { ChainableCommander, Redis as RedisClient } from "ioredis";
import { CacheOption } from "../type";

/**
 * 基础缓存类
 */
export class BaseCache {
  protected option: CacheOption; // 缓存选项
  protected redis: RedisClient; // Redis 客户端实例
  protected prefix: string; // 缓存键前缀

  /**
   * 构造函数
   * @param prefix - 缓存键前缀
   * @param option - 缓存选项
   * @param redisClient - Redis 客户端实例
   */
  constructor(prefix: string, option: CacheOption, redisClient: RedisClient) {
    this.option = option;
    this.redis = redisClient;
    this.prefix = prefix;
  }

  /**
   * 创建缓存键
   * @param suffix - 可选的键值
   * @returns 生成的缓存键
   */
  createKey(suffix?: string | number | boolean): string {
    const baseKey = `${this.prefix}-${this.option.appName}-${this.option.funcName}`;
    return suffix !== undefined && suffix !== null && suffix !== ""
      ? `${baseKey}-${suffix}`
      : baseKey;
  }

  /**
   * 将数据转换为字符串
   * @param data - 要转换的数据
   * @returns 转换后的字符串
   */
  protected dataToString(data: any): string {
    switch (typeof data) {
      case "object":
        return JSON.stringify(data);
      case "boolean":
        return data ? "true" : "false";
      default:
        return String(data);
    }
  }

  /**
   * 创建管道操作
   * @returns 创建的管道实例
   */
  createPipeline() {
    return this.redis.pipeline();
  }

  /**
   * 执行事务操作
   * @param commands - 包含事务命令的回调函数
   * @returns 事务执行结果的 Promise
   */
  async executeTransaction(
    commands: (pipeline: ChainableCommander) => void
  ): Promise<any> {
    const pipeline = this.redis.multi();
    commands(pipeline);
    return pipeline.exec();
  }
  
}
