import { BitCountRange } from "../type";
import { BaseCache } from "./base";
export class CacheBitField extends BaseCache {
    /**
     * 设置位域的某一位
     * @param offset - 位的偏移量
     * @param value - 位的值（true 或 false）
     * @param suffix - 可选的键后缀
     * @returns 之前的位值
     */
    async setbit(
      offset: number,
      value: boolean,
      suffix: string = ""
    ): Promise<boolean> {
      const result = await this.redis.setbit(
        this.createKey(suffix),
        offset,
        value ? 1 : 0
      );
      return result > 0;
    }
  
    /**
     * 获取位域的某一位
     * @param offset - 位的偏移量
     * @param suffix - 可选的键后缀
     * @returns 位值（0 或 1）
     */
    async getbit(offset: number, suffix: string = ""): Promise<number> {
      return await this.redis.getbit(this.createKey(suffix), offset);
    }
  
    /**
     * 计算位域中指定范围内的位数
     * @param option - 位数计算范围和模式
     * @param suffix - 可选的键后缀
     * @returns 位数
     */
    async count(option: BitCountRange, suffix: string = ""): Promise<number> {
      const key = this.createKey(suffix);
      const { start, end, mode } = option;
  
      if (mode === "BYTE") {
        return await this.redis.bitcount(key, start, end, "BYTE");
      } else if (mode === "BIT") {
        return await this.redis.bitcount(key, start, end, "BIT");
      } else {
        return await this.redis.bitcount(key, start, end);
      }
    }
  
    /**
     * 对位域执行位操作
     * @param operation - 位操作类型（AND, OR, XOR, NOT）
     * @param destKey - 目标键
     * @param keys - 源键数组
     * @returns 结果位数
     */
    async bitop(
      operation: "AND" | "OR" | "XOR" | "NOT",
      destKey: string,
      keys: string[]
    ): Promise<number> {
      return await this.redis.bitop(
        operation,
        destKey,
        ...keys.map(this.createKey.bind(this))
      );
    }
  }