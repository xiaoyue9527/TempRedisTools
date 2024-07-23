import { Redis as RedisClient } from "ioredis";
import { CacheOption } from "../type";
type TimeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
/**
 * 基础统计类，提供统计功能的基本操作。
 * @abstract
 */
export declare abstract class BaseStatistic {
    protected option: CacheOption;
    protected redis: RedisClient;
    protected prefix: string;
    protected timeUnit: TimeUnit;
    /**
     * 创建一个 BaseStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient);
    /**
     * 创建Redis键。
     * @param {string} suffix - 键的后缀。
     * @returns {string} 生成的Redis键。
     * @protected
     */
    createKey(suffix: string): string;
    /**
     * 设置时间单位。
     * @param {TimeUnit} unit - 时间单位。
     * @returns {this} 当前实例。
     */
    setTimeUnit(unit: TimeUnit): this;
    /**
     * 获取时间后缀。
     * @returns {string} 时间后缀。
     * @private
     */
    private getTimeSuffix;
    /**
     * 添加统计数据。
     * @param {string} value - 要添加的值。
     * @returns {Promise<void>}
     * @abstract
     */
    abstract add(value: string): Promise<void>;
    /**
     * 获取统计数据的数量。
     * @returns {Promise<number>}
     * @abstract
     */
    abstract getCount(): Promise<number>;
}
export {};
