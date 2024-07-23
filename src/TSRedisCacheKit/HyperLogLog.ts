import { BaseCache } from "./base";

export class CacheHyperLogLog extends BaseCache {
  /**
   * 添加元素到 HyperLogLog
   * @param suffix - 可选的键后缀
   * @param values - 要添加的元素
   * @returns 是否成功添加
   */
  async add(suffix: string = "", ...values: any[]): Promise<boolean> {
    const args = values.map((value) => this.dataToString(value));
    const result = await this.redis.pfadd(this.createKey(suffix), ...args);
    return result > 0;
  }

  /**
   * 获取 HyperLogLog 中的基数估算值
   * @param suffix - 可选的键后缀
   * @returns 基数估算值
   */
  async count(suffix: string = ""): Promise<number> {
    return await this.redis.pfcount(this.createKey(suffix));
  }

  /**
   * 合并多个 HyperLogLog
   * @param suffix - 目标 HyperLogLog 的键后缀
   * @param keys - 要合并的 HyperLogLog 的键
   * @returns 是否成功合并
   */
  async merge(suffix: string = "", ...keys: string[]): Promise<boolean> {
    const result = await this.redis.pfmerge(
      this.createKey(suffix),
      ...keys.map((key) => `testPrefix-${key}`) // 这里不再使用 createKey 方法
    );
    return result === "OK";
  }

  /**
   * 删除 HyperLogLog
   * @param suffix - 可选的键后缀
   * @returns 是否成功删除
   */
  async delete(suffix: string = ""): Promise<boolean> {
    const result = await this.redis.del(this.createKey(suffix));
    return result > 0;
  }

  /**
   * 重命名 HyperLogLog
   * @param oldSuffix - 旧的键后缀
   * @param newSuffix - 新的键后缀
   * @returns 是否成功重命名
   */
  async rename(oldSuffix: string, newSuffix: string): Promise<boolean> {
    const result = await this.redis.rename(
      this.createKey(oldSuffix),
      this.createKey(newSuffix)
    );
    return result === "OK";
  }

  /**
   * 获取 HyperLogLog 的内存使用情况
   * @param suffix - 可选的键后缀
   * @returns 内存使用情况（字节）
   */
  async memoryUsage(suffix: string = ""): Promise<number | null> {
    return await this.redis.memory("USAGE", this.createKey(suffix));
  }
}
