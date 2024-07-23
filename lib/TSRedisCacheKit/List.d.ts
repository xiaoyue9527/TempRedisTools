import { BaseCache } from "./base";
export declare class CacheList extends BaseCache {
    /**
     * 从右侧推入元素到列表
     * @param suffix - 可选的键后缀
     * @param values - 要推入的元素
     * @returns 列表的长度
     */
    push(suffix?: string, ...values: any[]): Promise<number>;
    /**
     * 从右侧弹出元素
     * @param suffix - 可选的键后缀
     * @returns 弹出的元素
     */
    pop(suffix?: string): Promise<string | null>;
    /**
     * 获取列表的长度
     * @param suffix - 可选的键后缀
     * @returns 列表的长度
     */
    length(suffix?: string): Promise<number>;
    /**
     * 获取列表的指定范围内的元素
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 指定范围内的元素
     */
    range(start: number, stop: number, suffix?: string): Promise<string[]>;
    /**
     * 从左侧推入元素到列表
     * @param suffix - 可选的键后缀
     * @param values - 要推入的元素
     * @returns 列表的长度
     */
    lpush(suffix?: string, ...values: any[]): Promise<number>;
    /**
     * 从左侧弹出元素
     * @param suffix - 可选的键后缀
     * @returns 弹出的元素
     */
    lpop(suffix?: string): Promise<string | null>;
    /**
     * 修剪列表，只保留指定范围内的元素
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 修剪结果
     */
    trim(start: number, stop: number, suffix?: string): Promise<string>;
    /**
     * 设置指定索引处的值
     * @param index - 索引
     * @param value - 新值
     * @param suffix - 可选的键后缀
     * @returns 设置结果
     */
    set(index: number, value: any, suffix?: string): Promise<string>;
    /**
     * 根据值移除元素
     * @param count - 移除的元素数量
     * @param value - 要移除的元素
     * @param suffix - 可选的键后缀
     * @returns 移除的元素数量
     */
    remove(count: number, value: any, suffix?: string): Promise<number>;
    /**
     * 在指定元素前或后插入新元素
     * @param pivot - 参考元素
     * @param value - 新元素
     * @param position - 插入位置（"BEFORE" 或 "AFTER"）
     * @param suffix - 可选的键后缀
     * @returns 插入后列表的长度
     */
    insert(pivot: any, value: any, position: "BEFORE" | "AFTER", suffix?: string): Promise<number>;
}
