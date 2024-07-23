import { BaseCache } from "./base";

export class CacheList extends BaseCache {
  /**
   * 从右侧推入元素到列表
   * @param suffix - 可选的键后缀
   * @param values - 要推入的元素
   * @returns 列表的长度
   */
  async push(suffix: string = "", ...values: any[]): Promise<number> {
    const args = values.map((value) => this.dataToString(value));
    return await this.redis.rpush(this.createKey(suffix), ...args);
  }

  /**
   * 从右侧弹出元素
   * @param suffix - 可选的键后缀
   * @returns 弹出的元素
   */
  async pop(suffix: string = ""): Promise<string | null> {
    return await this.redis.rpop(this.createKey(suffix));
  }

  /**
   * 获取列表的长度
   * @param suffix - 可选的键后缀
   * @returns 列表的长度
   */
  async length(suffix: string = ""): Promise<number> {
    return await this.redis.llen(this.createKey(suffix));
  }

  /**
   * 获取列表的指定范围内的元素
   * @param start - 起始索引
   * @param stop - 结束索引
   * @param suffix - 可选的键后缀
   * @returns 指定范围内的元素
   */
  async range(
    start: number,
    stop: number,
    suffix: string = ""
  ): Promise<string[]> {
    return await this.redis.lrange(this.createKey(suffix), start, stop);
  }

  /**
   * 从左侧推入元素到列表
   * @param suffix - 可选的键后缀
   * @param values - 要推入的元素
   * @returns 列表的长度
   */
  async lpush(suffix: string = "", ...values: any[]): Promise<number> {
    const args = values.map((value) => this.dataToString(value));
    return await this.redis.lpush(this.createKey(suffix), ...args);
  }

  /**
   * 从左侧弹出元素
   * @param suffix - 可选的键后缀
   * @returns 弹出的元素
   */
  async lpop(suffix: string = ""): Promise<string | null> {
    return await this.redis.lpop(this.createKey(suffix));
  }

  /**
   * 修剪列表，只保留指定范围内的元素
   * @param start - 起始索引
   * @param stop - 结束索引
   * @param suffix - 可选的键后缀
   * @returns 修剪结果
   */
  async trim(
    start: number,
    stop: number,
    suffix: string = ""
  ): Promise<string> {
    return await this.redis.ltrim(this.createKey(suffix), start, stop);
  }

  /**
   * 设置指定索引处的值
   * @param index - 索引
   * @param value - 新值
   * @param suffix - 可选的键后缀
   * @returns 设置结果
   */
  async set(index: number, value: any, suffix: string = ""): Promise<string> {
    return await this.redis.lset(
      this.createKey(suffix),
      index,
      this.dataToString(value)
    );
  }

  /**
   * 根据值移除元素
   * @param count - 移除的元素数量
   * @param value - 要移除的元素
   * @param suffix - 可选的键后缀
   * @returns 移除的元素数量
   */
  async remove(
    count: number,
    value: any,
    suffix: string = ""
  ): Promise<number> {
    return await this.redis.lrem(
      this.createKey(suffix),
      count,
      this.dataToString(value)
    );
  }

  /**
   * 在指定元素前或后插入新元素
   * @param pivot - 参考元素
   * @param value - 新元素
   * @param position - 插入位置（"BEFORE" 或 "AFTER"）
   * @param suffix - 可选的键后缀
   * @returns 插入后列表的长度
   */
  async insert(
    pivot: any,
    value: any,
    position: "BEFORE" | "AFTER",
    suffix: string = ""
  ): Promise<number> {
    const key = this.createKey(suffix);
    const pivotStr = this.dataToString(pivot);
    const valueStr = this.dataToString(value);

    if (position === "BEFORE") {
      return await this.redis.linsert(key, "BEFORE", pivotStr, valueStr);
    } else if (position === "AFTER") {
      return await this.redis.linsert(key, "AFTER", pivotStr, valueStr);
    } else {
      throw new Error(
        "Invalid position argument. Must be 'BEFORE' or 'AFTER'."
      );
    }
  }
}
