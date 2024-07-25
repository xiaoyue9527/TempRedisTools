import { Redis as RedisClient } from "ioredis";
/**
 * 综合排行榜类
 */
export declare class CompositeLeaderboard {
    private redis;
    private leaderboards;
    private ratingSystems;
    private compositeKey;
    /**
     * 构造函数
     * @param {RedisClient} redis - Redis客户端实例
     * @param {string} compositeKey - 综合排行榜的键
     */
    constructor(redis: RedisClient, compositeKey: string);
    /**
     * 获取排行榜键
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {string} 排行榜键
     */
    private getLeaderboardKey;
    /**
     * 获取排行榜实例
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {Leaderboard} 排行榜实例
     */
    private getLeaderboard;
    /**
     * 获取评分系统键
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {string} 评分系统键
     */
    private getRatingSystemKey;
    /**
     * 获取评分系统实例
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {RatingSystem} 评分系统实例
     */
    private getRatingSystem;
    /**
     * 添加用户积分
     * @param {string} userId - 用户ID
     * @param {number} score - 积分
     * @param {string} date - 日期
     */
    addScore(userId: string, score: number, date: string): Promise<void>;
    /**
     * 添加用户评分
     * @param {string} itemId - 项目ID
     * @param {number} score - 评分
     * @param {string} date - 日期
     */
    addRating(itemId: string, score: number, date: string): Promise<void>;
    /**
     * 获取用户综合排名及评分
     * @param {string} userId - 用户ID
     * @param {string} date - 日期
     * @returns {Promise<{rank: number, score: number}>} 用户的综合排名及评分
     */
    getCompositeRank(userId: string, date: string): Promise<{
        rank: number;
        score: number;
    }>;
    /**
     * 获取前N名用户及其综合评分
     * @param {number} n - 用户数量
     * @param {string} date - 日期
     * @returns {Promise<Array<{member: string, score: number}>>} 前N名用户及其综合评分
     */
    getTopCompositeUsers(n: number, date: string): Promise<{
        member: string;
        score: number;
    }[]>;
}
