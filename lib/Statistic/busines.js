"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewUserStatistic = exports.UserActionCountStatistic = exports.PageViewStatistic = exports.UserSignInStatistic = exports.UniqueIPStatistic = void 0;
const base_1 = require("./base");
/**
 * 表示唯一IP统计的类。
 * @extends BaseStatistic
 */
class UniqueIPStatistic extends base_1.BaseStatistic {
    /**
     * 创建一个 UniqueIPStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix, option, redisClient) {
        super(prefix, option, redisClient);
    }
    /**
     * 添加一个唯一的IP地址到统计中。
     * @param {string} ip - 要添加的IP地址。
     * @returns {Promise<void>}
     */
    async add(ip) {
        const key = this.createKey("unique-ip");
        await this.redis.pfadd(key, ip);
    }
    /**
     * 获取唯一IP的数量。
     * @returns {Promise<number>}
     */
    async getCount() {
        const key = this.createKey("unique-ip");
        return await this.redis.pfcount(key);
    }
}
exports.UniqueIPStatistic = UniqueIPStatistic;
/**
 * 表示用户签到统计的类。
 * @extends BaseStatistic
 */
class UserSignInStatistic extends base_1.BaseStatistic {
    /**
     * 创建一个 UserSignInStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix, option, redisClient) {
        super(prefix, option, redisClient);
    }
    /**
     * 添加一个用户签到记录。
     * @param {string} userId - 用户ID。
     * @returns {Promise<void>}
     */
    async add(userId) {
        const key = this.createKey(userId);
        const today = new Date().getDate();
        await this.redis.setbit(key, today, 1);
    }
    /**
     * 获取签到用户的数量。
     * @returns {Promise<number>}
     */
    async getCount() {
        const key = this.createKey("user-sign-in");
        return await this.redis.bitcount(key);
    }
    /**
     * 记录用户签到。
     * @param {string} userId - 用户ID。
     * @returns {Promise<void>}
     */
    async signIn(userId) {
        await this.add(userId);
    }
    /**
     * 获取用户今日的签到状态。
     * @param {string} userId - 用户ID。
     * @returns {Promise<boolean>}
     */
    async getSignInStatus(userId) {
        const key = this.createKey(userId);
        const today = new Date().getDate();
        return (await this.redis.getbit(key, today)) === 1;
    }
    /**
     * 获取用户的签到次数。
     * @param {string} userId - 用户ID。
     * @returns {Promise<number>}
     */
    async getSignInCount(userId) {
        const key = this.createKey(userId);
        return await this.redis.bitcount(key);
    }
}
exports.UserSignInStatistic = UserSignInStatistic;
/**
 * 表示页面浏览统计的类。
 * @extends BaseStatistic
 */
class PageViewStatistic extends base_1.BaseStatistic {
    /**
     * 创建一个 PageViewStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix, option, redisClient) {
        super(prefix, option, redisClient);
    }
    /**
     * 增加页面浏览次数。
     * @returns {Promise<void>}
     */
    async add() {
        const key = this.createKey("page-view");
        await this.redis.incr(key);
    }
    /**
     * 获取页面浏览次数。
     * @returns {Promise<number>}
     */
    async getCount() {
        const key = this.createKey("page-view");
        const count = await this.redis.get(key);
        return count ? parseInt(count) : 0;
    }
}
exports.PageViewStatistic = PageViewStatistic;
/**
 * 表示用户行为计数统计的类。
 * @extends BaseStatistic
 */
class UserActionCountStatistic extends base_1.BaseStatistic {
    /**
     * 创建一个 UserActionCountStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix, option, redisClient) {
        super(prefix, option, redisClient);
    }
    /**
     * 增加用户行为计数。
     * @returns {Promise<void>}
     */
    async add() {
        const key = this.createKey("user-action");
        await this.redis.incr(key);
    }
    /**
     * 获取用户行为计数。
     * @returns {Promise<number>}
     */
    async getCount() {
        const key = this.createKey("user-action");
        const count = await this.redis.get(key);
        return count ? parseInt(count) : 0;
    }
}
exports.UserActionCountStatistic = UserActionCountStatistic;
/**
 * 表示新用户统计的类。
 * @extends BaseStatistic
 */
class NewUserStatistic extends base_1.BaseStatistic {
    /**
     * 创建一个 NewUserStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix, option, redisClient) {
        super(prefix, option, redisClient);
    }
    /**
     * 添加一个新用户到统计中。
     * @param {string} userId - 用户ID。
     * @returns {Promise<void>}
     */
    async add(userId) {
        const key = this.createKey("new-user");
        await this.redis.pfadd(key, userId);
    }
    /**
     * 获取新用户的数量。
     * @returns {Promise<number>}
     */
    async getCount() {
        const key = this.createKey("new-user");
        return await this.redis.pfcount(key);
    }
}
exports.NewUserStatistic = NewUserStatistic;
