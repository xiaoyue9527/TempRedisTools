import { BaseCache } from "./base";

export class CacheHash extends BaseCache {
  /**
   * 设置哈希表中的字段值
   * @param key - 字段名
   * @param value - 字段值
   * @param suffix - 可选的键后缀
   * @returns 是否成功设置
   */
  async set(
    key: string,
    value: Record<string, any>,
    suffix: string = ""
  ): Promise<boolean> {
    const result = await this.redis.hset(
      this.createKey(suffix),
      key,
      JSON.stringify(value)
    );
    return result > 0;
  }

  /**
   * 获取哈希表中的字段值
   * @param key - 字段名
   * @param suffix - 可选的键后缀
   * @returns 字段值或 null
   */
  async get(
    key: string,
    suffix: string = ""
  ): Promise<Record<string, any> | null> {
    const result = await this.redis.hget(this.createKey(suffix), key);
    return result ? JSON.parse(result) : null;
  }

  /**
   * 获取哈希表中的所有字段和值
   * @param suffix - 可选的键后缀
   * @returns 哈希表中的所有字段和值
   */
  async getAll(suffix: string = ""): Promise<Record<string, any>> {
    const result = await this.redis.hgetall(this.createKey(suffix));
    return Object.fromEntries(
      Object.entries(result).map(([key, value]) => [key, JSON.parse(value)])
    );
  }

  /**
   * 检查哈希表中是否存在指定字段
   * @param key - 字段名
   * @param suffix - 可选的键后缀
   * @returns 是否存在
   */
  async exists(key: string, suffix: string = ""): Promise<number> {
    return await this.redis.hexists(this.createKey(suffix), key);
  }

  /**
   * 删除哈希表中的指定字段
   * @param key - 字段名
   * @param suffix - 可选的键后缀
   * @returns 是否成功删除
   */
  async delete(key: string, suffix: string = ""): Promise<boolean> {
    const result = await this.redis.hdel(this.createKey(suffix), key);
    return result > 0;
  }

  /**
   * 获取哈希表中所有字段的数量
   * @param suffix - 可选的键后缀
   * @returns 字段数量
   */
  async length(suffix: string = ""): Promise<number> {
    return await this.redis.hlen(this.createKey(suffix));
  }

  /**
   * 获取哈希表中的所有字段名
   * @param suffix - 可选的键后缀
   * @returns 所有字段名
   */
  async keys(suffix: string = ""): Promise<string[]> {
    return await this.redis.hkeys(this.createKey(suffix));
  }

  /**
   * 获取哈希表中的所有字段值
   * @param suffix - 可选的键后缀
   * @returns 所有字段值
   */
  async values(suffix: string = ""): Promise<any[]> {
    const result = await this.redis.hvals(this.createKey(suffix));
    return result.map((value) => JSON.parse(value));
  }

  /**
   * 为哈希表中的字段值加上指定增量
   * @param key - 字段名
   * @param increment - 增量
   * @param suffix - 可选的键后缀
   * @returns 增加后的值
   */
  async incrementBy(
    key: string,
    increment: number,
    suffix: string = ""
  ): Promise<number> {
    return await this.redis.hincrby(this.createKey(suffix), key, increment);
  }

  /**
   * 为哈希表中的字段值加上指定浮点增量
   * @param key - 字段名
   * @param increment - 浮点增量
   * @param suffix - 可选的键后缀
   * @returns 增加后的值
   */
  async incrementByFloat(
    key: string,
    increment: number,
    suffix: string = ""
  ): Promise<string> {
    return await this.redis.hincrbyfloat(
      this.createKey(suffix),
      key,
      increment
    );
  }
}
