import { BaseCache } from "./base";
export declare class CacheHyperLogLog extends BaseCache {
    /**
     * 添加元素到 HyperLogLog
     * @param suffix - 可选的键后缀
     * @param values - 要添加的元素
     * @returns 是否成功添加
     */
    add(suffix?: string, ...values: any[]): Promise<boolean>;
    /**
     * 获取 HyperLogLog 中的基数估算值
     * @param suffix - 可选的键后缀
     * @returns 基数估算值
     */
    count(suffix?: string): Promise<number>;
    /**
     * 合并多个 HyperLogLog
     * @param suffix - 目标 HyperLogLog 的键后缀
     * @param keys - 要合并的 HyperLogLog 的键
     * @returns 是否成功合并
     */
    merge(suffix?: string, ...keys: string[]): Promise<boolean>;
    /**
     * 删除 HyperLogLog
     * @param suffix - 可选的键后缀
     * @returns 是否成功删除
     */
    delete(suffix?: string): Promise<boolean>;
    /**
     * 重命名 HyperLogLog
     * @param oldSuffix - 旧的键后缀
     * @param newSuffix - 新的键后缀
     * @returns 是否成功重命名
     */
    rename(oldSuffix: string, newSuffix: string): Promise<boolean>;
    /**
     * 获取 HyperLogLog 的内存使用情况
     * @param suffix - 可选的键后缀
     * @returns 内存使用情况（字节）
     */
    memoryUsage(suffix?: string): Promise<number | null>;
}
