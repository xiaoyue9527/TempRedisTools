import { ZMember } from "../type";
import { BaseCache } from "./base";
export declare class CacheSortedSet extends BaseCache {
    /**
     * 添加一个成员到有序集合
     * @param score - 成员的分数
     * @param value - 成员的值
     * @param suffix - 可选的键后缀
     * @returns 是否成功添加
     */
    add(score: number, value: any, suffix?: string): Promise<boolean>;
    /**
     * 添加多个成员到有序集合
     * @param members - 成员数组
     * @param suffix - 可选的键后缀
     * @returns 是否成功添加
     */
    adds(members: ZMember[], suffix?: string): Promise<boolean>;
    /**
     * 移除有序集合中的一个成员
     * @param value - 成员的值
     * @param suffix - 可选的键后缀
     * @returns 是否成功移除
     */
    remove(value: any, suffix?: string): Promise<boolean>;
    /**
     * 计算有序集合中指定分数范围的成员数量
     * @param min - 最小分数
     * @param max - 最大分数
     * @param suffix - 可选的键后缀
     * @returns 成员数量
     */
    count(min: number, max: number, suffix?: string): Promise<number>;
    /**
     * 获取有序集合中指定分数范围的成员
     * @param min - 最小分数
     * @param max - 最大分数
     * @param suffix - 可选的键后缀
     * @returns 成员数组
     */
    rangeByScore(min: number, max: number, suffix?: string): Promise<string[]>;
    /**
     * 获取有序集合中的元素数量
     * @param suffix - 可选的键后缀
     * @returns 元素数量
     */
    length(suffix?: string): Promise<number>;
    /**
     * 获取有序集合中指定范围内的元素
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 元素数组
     */
    range(start: number, stop: number, suffix?: string): Promise<string[]>;
    /**
     * 获取有序集合中指定范围内的元素及其分数
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 元素及其分数数组
     */
    rangeWithScores(start: number, stop: number, suffix?: string): Promise<{
        value: string;
        score: number;
    }[]>;
    /**
     * 获取有序集合中指定成员的分数
     * @param value - 成员的值
     * @param suffix - 可选的键后缀
     * @returns 成员的分数
     */
    score(value: any, suffix?: string): Promise<number | null>;
    /**
     * 为有序集合中的成员的分数加上指定增量
     * @param value - 成员的值
     * @param increment - 增量
     * @param suffix - 可选的键后缀
     * @returns 增加后的分数
     */
    incrementBy(value: any, increment: number, suffix?: string): Promise<string>;
    /**
     * 删除有序集合中指定分数范围的成员
     * @param min - 最小分数
     * @param max - 最大分数
     * @param suffix - 可选的键后缀
     * @returns 删除的成员数量
     */
    removeRangeByScore(min: number, max: number, suffix?: string): Promise<number>;
    /**
     * 删除有序集合中指定排名范围的成员
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 删除的成员数量
     */
    removeRangeByRank(start: number, stop: number, suffix?: string): Promise<number>;
}
