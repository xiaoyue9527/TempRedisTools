import { BaseCache } from "./base";

export class CacheSet extends BaseCache {
  /**
   * 添加一个元素到集合
   * @param value - 要添加的元素
   * @param suffix - 可选的键后缀
   * @returns 是否成功添加
   */
  async add(value: any, suffix: string = ""): Promise<boolean> {
    const result = await this.redis.sadd(
      this.createKey(suffix),
      this.dataToString(value)
    );
    return result > 0;
  }

  /**
   * 批量添加元素到集合
   * @param values - 要添加的元素数组
   * @param suffix - 可选的键后缀
   * @returns 是否成功添加
   */
  async addBatch(values: any[], suffix: string = ""): Promise<boolean> {
    const args = values.map((value) => this.dataToString(value));
    const result = await this.redis.sadd(this.createKey(suffix), ...args);
    return result > 0;
  }

  /**
   * 从集合中移除一个元素
   * @param value - 要移除的元素
   * @param suffix - 可选的键后缀
   * @returns 是否成功移除
   */
  async remove(value: any, suffix: string = ""): Promise<boolean> {
    const result = await this.redis.srem(
      this.createKey(suffix),
      this.dataToString(value)
    );
    return result > 0;
  }

  /**
   * 批量移除集合中的元素
   * @param values - 要移除的元素数组
   * @param suffix - 可选的键后缀
   * @returns 是否成功移除
   */
  async removeBatch(values: any[], suffix: string = ""): Promise<boolean> {
    const args = values.map((value) => this.dataToString(value));
    const result = await this.redis.srem(this.createKey(suffix), ...args);
    return result > 0;
  }

  /**
   * 获取集合中的所有元素
   * @param suffix - 可选的键后缀
   * @returns 集合中的所有元素
   */
  async members(suffix: string = ""): Promise<string[]> {
    return await this.redis.smembers(this.createKey(suffix));
  }

  /**
   * 检查元素是否在集合中
   * @param value - 要检查的元素
   * @param suffix - 可选的键后缀
   * @returns 元素是否存在
   */
  async exists(value: any, suffix: string = ""): Promise<number> {
    return await this.redis.sismember(
      this.createKey(suffix),
      this.dataToString(value)
    );
  }

  /**
   * 获取集合的大小
   * @param suffix - 可选的键后缀
   * @returns 集合的大小
   */
  async size(suffix: string = ""): Promise<number> {
    return await this.redis.scard(this.createKey(suffix));
  }

  /**
   * 随机弹出一个元素
   * @param suffix - 可选的键后缀
   * @returns 弹出的元素
   */
  async pop(suffix: string = ""): Promise<string | null> {
    return await this.redis.spop(this.createKey(suffix));
  }

  /**
   * 随机弹出多个元素
   * @param count - 要弹出的元素数量
   * @param suffix - 可选的键后缀
   * @returns 弹出的元素数组
   */
  async popMultiple(count: number, suffix: string = ""): Promise<string[]> {
    return await this.redis.spop(this.createKey(suffix), count);
  }

  /**
   * 随机获取一个元素
   * @param suffix - 可选的键后缀
   * @returns 随机获取的元素
   */
  async randomMember(suffix: string = ""): Promise<string | null> {
    return await this.redis.srandmember(this.createKey(suffix));
  }

  /**
   * 随机获取多个元素
   * @param count - 要获取的元素数量
   * @param suffix - 可选的键后缀
   * @returns 随机获取的元素数组
   */
  async randomMembers(count: number, suffix: string = ""): Promise<string[]> {
    return await this.redis.srandmember(this.createKey(suffix), count);
  }

  /**
   * 获取多个集合的并集
   * @param suffixes - 键后缀数组
   * @returns 并集结果
   */
  async union(...suffixes: string[]): Promise<string[]> {
    const keys = suffixes.map((suffix) => this.createKey(suffix));
    return await this.redis.sunion(...keys);
  }

  /**
   * 获取多个集合的交集
   * @param suffixes - 键后缀数组
   * @returns 交集结果
   */
  async intersect(...suffixes: string[]): Promise<string[]> {
    const keys = suffixes.map((suffix) => this.createKey(suffix));
    return await this.redis.sinter(...keys);
  }

  /**
   * 获取多个集合的差集
   * @param suffixes - 键后缀数组
   * @returns 差集结果
   */
  async difference(...suffixes: string[]): Promise<string[]> {
    const keys = suffixes.map((suffix) => this.createKey(suffix));
    return await this.redis.sdiff(...keys);
  }
}
