import { Redis as RedisClient } from "ioredis";
import { BaseStatistic } from "./base";
import { CacheOption } from "../type";
/**
 * 表示唯一IP统计的类。
 * @extends BaseStatistic
 */
export declare class UniqueIPStatistic extends BaseStatistic {
    /**
     * 创建一个 UniqueIPStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient);
    /**
     * 添加一个唯一的IP地址到统计中。
     * @param {string} ip - 要添加的IP地址。
     * @returns {Promise<void>}
     */
    add(ip: string): Promise<void>;
    /**
     * 获取唯一IP的数量。
     * @returns {Promise<number>}
     */
    getCount(): Promise<number>;
}
/**
 * 表示用户签到统计的类。
 * @extends BaseStatistic
 */
export declare class UserSignInStatistic extends BaseStatistic {
    /**
     * 创建一个 UserSignInStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient);
    /**
     * 添加一个用户签到记录。
     * @param {string} userId - 用户ID。
     * @returns {Promise<void>}
     */
    add(userId: string): Promise<void>;
    /**
     * 获取签到用户的数量。
     * @returns {Promise<number>}
     */
    getCount(): Promise<number>;
    /**
     * 记录用户签到。
     * @param {string} userId - 用户ID。
     * @returns {Promise<void>}
     */
    signIn(userId: string): Promise<void>;
    /**
     * 获取用户今日的签到状态。
     * @param {string} userId - 用户ID。
     * @returns {Promise<boolean>}
     */
    getSignInStatus(userId: string): Promise<boolean>;
    /**
     * 获取用户的签到次数。
     * @param {string} userId - 用户ID。
     * @returns {Promise<number>}
     */
    getSignInCount(userId: string): Promise<number>;
}
/**
 * 表示页面浏览统计的类。
 * @extends BaseStatistic
 */
export declare class PageViewStatistic extends BaseStatistic {
    /**
     * 创建一个 PageViewStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient);
    /**
     * 增加页面浏览次数。
     * @returns {Promise<void>}
     */
    add(): Promise<void>;
    /**
     * 获取页面浏览次数。
     * @returns {Promise<number>}
     */
    getCount(): Promise<number>;
}
/**
 * 表示用户行为计数统计的类。
 * @extends BaseStatistic
 */
export declare class UserActionCountStatistic extends BaseStatistic {
    /**
     * 创建一个 UserActionCountStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient);
    /**
     * 增加用户行为计数。
     * @returns {Promise<void>}
     */
    add(): Promise<void>;
    /**
     * 获取用户行为计数。
     * @returns {Promise<number>}
     */
    getCount(): Promise<number>;
}
/**
 * 表示新用户统计的类。
 * @extends BaseStatistic
 */
export declare class NewUserStatistic extends BaseStatistic {
    /**
     * 创建一个 NewUserStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient);
    /**
     * 添加一个新用户到统计中。
     * @param {string} userId - 用户ID。
     * @returns {Promise<void>}
     */
    add(userId: string): Promise<void>;
    /**
     * 获取新用户的数量。
     * @returns {Promise<number>}
     */
    getCount(): Promise<number>;
}
