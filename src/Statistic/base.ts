import { Redis as RedisClient } from "ioredis";
import { CacheOption } from "../type";
import {
  getTodayString,
  getCurrentHourString,
  getCurrentMonthString,
  getCurrentYearString,
} from "../tools/time";

// 定义时间单位类型
type TimeUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

/**
 * 基础统计类，提供统计功能的基本操作。
 * @abstract
 */
export abstract class BaseStatistic {
  protected option: CacheOption;
  protected redis: RedisClient;
  protected prefix: string;
  protected timeUnit: TimeUnit = "day"; // 默认时间单位为 'day'

  /**
   * 创建一个 BaseStatistic 实例。
   * @param {string} prefix - Redis键的前缀。
   * @param {CacheOption} option - 缓存选项。
   * @param {RedisClient} redisClient - Redis客户端。
   */
  constructor(prefix: string, option: CacheOption, redisClient: RedisClient) {
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
  createKey(suffix: string): string {
    const timeSuffix = this.getTimeSuffix();
    return `${this.prefix}-${this.option.appName}-${this.option.funcName}-${timeSuffix}-${suffix}`;
  }

  /**
   * 设置时间单位。
   * @param {TimeUnit} unit - 时间单位。
   * @returns {this} 当前实例。
   */
  setTimeUnit(unit: TimeUnit) {
    this.timeUnit = unit;
    return this;
  }

  /**
   * 获取时间后缀。
   * @returns {string} 时间后缀。
   * @private
   */
  private getTimeSuffix(): string {
    const date = new Date();
    switch (this.timeUnit) {
      case "second":
        return `${getTodayString(
          date
        )}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
      case "minute":
        return `${getTodayString(
          date
        )}-${date.getHours()}-${date.getMinutes()}`;
      case "hour":
        return getCurrentHourString(date);
      case "day":
        return getTodayString(date);
      case "week":
        // 计算当前周的第一天
        const firstDayOfWeek = new Date(
          date.setDate(date.getDate() - date.getDay())
        );
        return getTodayString(firstDayOfWeek);
      case "month":
        return getCurrentMonthString(date);
      case "year":
        return getCurrentYearString(date);
      default:
        return getTodayString(date);
    }
  }

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
