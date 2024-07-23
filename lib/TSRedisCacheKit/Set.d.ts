import { BaseCache } from "./base";
export declare class CacheSet extends BaseCache {
    /**
     * 添加一个元素到集合
     * @param value - 要添加的元素
     * @param suffix - 可选的键后缀
     * @returns 是否成功添加
     */
    add(value: any, suffix?: string): Promise<boolean>;
    /**
     * 批量添加元素到集合
     * @param values - 要添加的元素数组
     * @param suffix - 可选的键后缀
     * @returns 是否成功添加
     */
    addBatch(values: any[], suffix?: string): Promise<boolean>;
    /**
     * 从集合中移除一个元素
     * @param value - 要移除的元素
     * @param suffix - 可选的键后缀
     * @returns 是否成功移除
     */
    remove(value: any, suffix?: string): Promise<boolean>;
    /**
     * 批量移除集合中的元素
     * @param values - 要移除的元素数组
     * @param suffix - 可选的键后缀
     * @returns 是否成功移除
     */
    removeBatch(values: any[], suffix?: string): Promise<boolean>;
    /**
     * 获取集合中的所有元素
     * @param suffix - 可选的键后缀
     * @returns 集合中的所有元素
     */
    members(suffix?: string): Promise<string[]>;
    /**
     * 检查元素是否在集合中
     * @param value - 要检查的元素
     * @param suffix - 可选的键后缀
     * @returns 元素是否存在
     */
    exists(value: any, suffix?: string): Promise<number>;
    /**
     * 获取集合的大小
     * @param suffix - 可选的键后缀
     * @returns 集合的大小
     */
    size(suffix?: string): Promise<number>;
    /**
     * 随机弹出一个元素
     * @param suffix - 可选的键后缀
     * @returns 弹出的元素
     */
    pop(suffix?: string): Promise<string | null>;
    /**
     * 随机弹出多个元素
     * @param count - 要弹出的元素数量
     * @param suffix - 可选的键后缀
     * @returns 弹出的元素数组
     */
    popMultiple(count: number, suffix?: string): Promise<string[]>;
    /**
     * 随机获取一个元素
     * @param suffix - 可选的键后缀
     * @returns 随机获取的元素
     */
    randomMember(suffix?: string): Promise<string | null>;
    /**
     * 随机获取多个元素
     * @param count - 要获取的元素数量
     * @param suffix - 可选的键后缀
     * @returns 随机获取的元素数组
     */
    randomMembers(count: number, suffix?: string): Promise<string[]>;
    /**
     * 获取多个集合的并集
     * @param suffixes - 键后缀数组
     * @returns 并集结果
     */
    union(...suffixes: string[]): Promise<string[]>;
    /**
     * 获取多个集合的交集
     * @param suffixes - 键后缀数组
     * @returns 交集结果
     */
    intersect(...suffixes: string[]): Promise<string[]>;
    /**
     * 获取多个集合的差集
     * @param suffixes - 键后缀数组
     * @returns 差集结果
     */
    difference(...suffixes: string[]): Promise<string[]>;
}
