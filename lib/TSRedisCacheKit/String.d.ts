import { BaseCache } from "./base";
export declare class CacheString extends BaseCache {
    /**
     * 设置字符串值
     * @param key - 缓存键
     * @param value - 缓存值
     * @param EX - 过期时间（秒），可选
     * @returns 设置结果
     */
    set(key: string, value: any, EX?: number): Promise<string | null>;
    /**
     * 获取字符串值
     * @param key - 缓存键
     * @returns 缓存值
     */
    get(key: string): Promise<string | null>;
    /**
     * 检查键是否存在
     * @param key - 缓存键
     * @returns 键是否存在
     */
    exists(key: string): Promise<number>;
    /**
     * 删除键
     * @param key - 缓存键
     * @returns 删除的键数量
     */
    delete(key: string): Promise<number>;
    /**
     * 增加键的值
     * @param key - 缓存键
     * @param increment - 增加的值
     * @returns 增加后的值
     */
    increment(key: string, increment?: number): Promise<number>;
    /**
     * 减少键的值
     * @param key - 缓存键
     * @param decrement - 减少的值
     * @returns 减少后的值
     */
    decrement(key: string, decrement?: number): Promise<number>;
    /**
     * 获取并设置新值
     * @param key - 缓存键
     * @param value - 新值
     * @returns 旧值
     */
    getSet(key: string, value: any): Promise<string | null>;
    /**
     * 设置多个键值对
     * @param keyValuePairs - 键值对数组
     * @returns 设置结果
     */
    setMultiple(keyValuePairs: {
        key: string;
        value: any;
    }[]): Promise<string>;
    /**
     * 获取多个键值对
     * @param keys - 键数组
     * @returns 值数组
     */
    getMultiple(keys: string[]): Promise<(string | null)[]>;
    /**
     * 设置键值对，如果键不存在
     * @param key - 缓存键
     * @param value - 缓存值
     * @returns 是否成功设置
     */
    setnx(key: string, value: any): Promise<number>;
    /**
     * 设置键值对，如果键不存在，并设置过期时间
     * @param key - 缓存键
     * @param value - 缓存值
     * @param EX - 过期时间（秒）
     * @returns 是否成功设置
     */
    setnxWithExpire(key: string, value: any, EX: number): Promise<string | null>;
}
