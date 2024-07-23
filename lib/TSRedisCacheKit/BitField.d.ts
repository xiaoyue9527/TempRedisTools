import { BitCountRange } from "../type";
import { BaseCache } from "./base";
export declare class CacheBitField extends BaseCache {
    /**
     * 设置位域的某一位
     * @param offset - 位的偏移量
     * @param value - 位的值（true 或 false）
     * @param suffix - 可选的键后缀
     * @returns 之前的位值
     */
    setbit(offset: number, value: boolean, suffix?: string): Promise<boolean>;
    /**
     * 获取位域的某一位
     * @param offset - 位的偏移量
     * @param suffix - 可选的键后缀
     * @returns 位值（0 或 1）
     */
    getbit(offset: number, suffix?: string): Promise<number>;
    /**
     * 计算位域中指定范围内的位数
     * @param option - 位数计算范围和模式
     * @param suffix - 可选的键后缀
     * @returns 位数
     */
    count(option: BitCountRange, suffix?: string): Promise<number>;
    /**
     * 对位域执行位操作
     * @param operation - 位操作类型（AND, OR, XOR, NOT）
     * @param destKey - 目标键
     * @param keys - 源键数组
     * @returns 结果位数
     */
    bitop(operation: "AND" | "OR" | "XOR" | "NOT", destKey: string, keys: string[]): Promise<number>;
}
