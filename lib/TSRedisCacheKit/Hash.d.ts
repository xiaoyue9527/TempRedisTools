import { BaseCache } from "./base";
export declare class CacheHash extends BaseCache {
    /**
     * 设置哈希表中的字段值
     * @param key - 字段名
     * @param value - 字段值
     * @param suffix - 可选的键后缀
     * @returns 是否成功设置
     */
    set(key: string, value: Record<string, any>, suffix?: string): Promise<boolean>;
    /**
     * 获取哈希表中的字段值
     * @param key - 字段名
     * @param suffix - 可选的键后缀
     * @returns 字段值或 null
     */
    get(key: string, suffix?: string): Promise<Record<string, any> | null>;
    /**
     * 获取哈希表中的所有字段和值
     * @param suffix - 可选的键后缀
     * @returns 哈希表中的所有字段和值
     */
    getAll(suffix?: string): Promise<Record<string, any>>;
    /**
     * 检查哈希表中是否存在指定字段
     * @param key - 字段名
     * @param suffix - 可选的键后缀
     * @returns 是否存在
     */
    exists(key: string, suffix?: string): Promise<number>;
    /**
     * 删除哈希表中的指定字段
     * @param key - 字段名
     * @param suffix - 可选的键后缀
     * @returns 是否成功删除
     */
    delete(key: string, suffix?: string): Promise<boolean>;
    /**
     * 获取哈希表中所有字段的数量
     * @param suffix - 可选的键后缀
     * @returns 字段数量
     */
    length(suffix?: string): Promise<number>;
    /**
     * 获取哈希表中的所有字段名
     * @param suffix - 可选的键后缀
     * @returns 所有字段名
     */
    keys(suffix?: string): Promise<string[]>;
    /**
     * 获取哈希表中的所有字段值
     * @param suffix - 可选的键后缀
     * @returns 所有字段值
     */
    values(suffix?: string): Promise<any[]>;
    /**
     * 为哈希表中的字段值加上指定增量
     * @param key - 字段名
     * @param increment - 增量
     * @param suffix - 可选的键后缀
     * @returns 增加后的值
     */
    incrementBy(key: string, increment: number, suffix?: string): Promise<number>;
    /**
     * 为哈希表中的字段值加上指定浮点增量
     * @param key - 字段名
     * @param increment - 浮点增量
     * @param suffix - 可选的键后缀
     * @returns 增加后的值
     */
    incrementByFloat(key: string, increment: number, suffix?: string): Promise<string>;
}
