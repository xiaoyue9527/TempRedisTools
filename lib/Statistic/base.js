"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStatistic = void 0;
const time_1 = require("../tools/time");
/**
 * 基础统计类，提供统计功能的基本操作。
 * @abstract
 */
class BaseStatistic {
    /**
     * 创建一个 BaseStatistic 实例。
     * @param {string} prefix - Redis键的前缀。
     * @param {CacheOption} option - 缓存选项。
     * @param {RedisClient} redisClient - Redis客户端。
     */
    constructor(prefix, option, redisClient) {
        this.timeUnit = "day"; // 默认时间单位为 'day'
        this.option = option;
        this.redis = redisClient;
        this.prefix = prefix;
    }
    /**
     * 创建Redis键。
     * @param {string} suffix - 键的后缀。
     * @returns {string} 生成的Redis键。
     * @protected
     */
    createKey(suffix) {
        const timeSuffix = this.getTimeSuffix();
        return `${this.prefix}-${this.option.appName}-${this.option.funcName}-${timeSuffix}-${suffix}`;
    }
    /**
     * 设置时间单位。
     * @param {TimeUnit} unit - 时间单位。
     * @returns {this} 当前实例。
     */
    setTimeUnit(unit) {
        this.timeUnit = unit;
        return this;
    }
    /**
     * 获取时间后缀。
     * @returns {string} 时间后缀。
     * @private
     */
    getTimeSuffix() {
        const date = new Date();
        switch (this.timeUnit) {
            case "second":
                return `${(0, time_1.getTodayString)(date)}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
            case "minute":
                return `${(0, time_1.getTodayString)(date)}-${date.getHours()}-${date.getMinutes()}`;
            case "hour":
                return (0, time_1.getCurrentHourString)(date);
            case "day":
                return (0, time_1.getTodayString)(date);
            case "week":
                // 计算当前周的第一天
                const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
                return (0, time_1.getTodayString)(firstDayOfWeek);
            case "month":
                return (0, time_1.getCurrentMonthString)(date);
            case "year":
                return (0, time_1.getCurrentYearString)(date);
            default:
                return (0, time_1.getTodayString)(date);
        }
    }
}
exports.BaseStatistic = BaseStatistic;
