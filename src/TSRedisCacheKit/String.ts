import { BaseCache } from "./base";

export class CacheString extends BaseCache {
  /**
   * 设置字符串值
   * @param key - 缓存键
   * @param value - 缓存值
   * @param EX - 过期时间（秒），可选
   * @returns 设置结果
   */
  async set(key: string, value: any, EX: number = -1): Promise<string | null> {
    const redisKey = this.createKey(key);
    const redisValue = this.dataToString(value);
    if (EX > 0) {
      return await this.redis.set(redisKey, redisValue, "EX", EX);
    } else {
      return await this.redis.set(redisKey, redisValue);
    }
  }

  /**
   * 获取字符串值
   * @param key - 缓存键
   * @returns 缓存值
   */
  async get(key: string): Promise<string | null> {
    return await this.redis.get(this.createKey(key));
  }

  /**
   * 检查键是否存在
   * @param key - 缓存键
   * @returns 键是否存在
   */
  async exists(key: string): Promise<number> {
    return await this.redis.exists(this.createKey(key));
  }

  /**
   * 删除键
   * @param key - 缓存键
   * @returns 删除的键数量
   */
  async delete(key: string): Promise<number> {
    return await this.redis.del(this.createKey(key));
  }

  /**
   * 增加键的值
   * @param key - 缓存键
   * @param increment - 增加的值
   * @returns 增加后的值
   */
  async increment(key: string, increment: number = 1): Promise<number> {
    return await this.redis.incrby(this.createKey(key), increment);
  }

  /**
   * 减少键的值
   * @param key - 缓存键
   * @param decrement - 减少的值
   * @returns 减少后的值
   */
  async decrement(key: string, decrement: number = 1): Promise<number> {
    return await this.redis.decrby(this.createKey(key), decrement);
  }

  /**
   * 获取并设置新值
   * @param key - 缓存键
   * @param value - 新值
   * @returns 旧值
   */
  async getSet(key: string, value: any): Promise<string | null> {
    const redisKey = this.createKey(key);
    const redisValue = this.dataToString(value);
    return await this.redis.getset(redisKey, redisValue);
  }

  /**
   * 设置多个键值对
   * @param keyValuePairs - 键值对数组
   * @returns 设置结果
   */
  async setMultiple(
    keyValuePairs: { key: string; value: any }[]
  ): Promise<string> {
    const flattenedPairs = keyValuePairs.flatMap(({ key, value }) => [
      this.createKey(key),
      this.dataToString(value),
    ]);
    return await this.redis.mset(flattenedPairs);
  }

  /**
   * 获取多个键值对
   * @param keys - 键数组
   * @returns 值数组
   */
  async getMultiple(keys: string[]): Promise<(string | null)[]> {
    const redisKeys = keys.map((key) => this.createKey(key));
    return await this.redis.mget(redisKeys);
  }

  /**
   * 设置键值对，如果键不存在
   * @param key - 缓存键
   * @param value - 缓存值
   * @returns 是否成功设置
   */
  async setnx(key: string, value: any): Promise<number> {
    const redisKey = this.createKey(key);
    const redisValue = this.dataToString(value);
    return await this.redis.setnx(redisKey, redisValue);
  }

  /**
   * 设置键值对，如果键不存在，并设置过期时间
   * @param key - 缓存键
   * @param value - 缓存值
   * @param EX - 过期时间（秒）
   * @returns 是否成功设置
   */
  async setnxWithExpire(
    key: string,
    value: any,
    EX: number
  ): Promise<string | null> {
    const redisKey = this.createKey(key);
    const redisValue = this.dataToString(value);
    return await this.redis.set(redisKey, redisValue, "EX", EX, "NX");
  } // 重载方案 set(key: RedisKey, value: string | Buffer | number, secondsToken: "EX", seconds: number | string, nx: "NX", callback?: Callback<"OK" | null>): Result<"OK" | null, Context>;
}
