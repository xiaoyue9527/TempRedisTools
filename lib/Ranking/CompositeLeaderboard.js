"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeLeaderboard = void 0;
const Leaderboard_1 = require("./Leaderboard");
const RatingSystem_1 = require("./RatingSystem");
/**
 * 综合排行榜类
 */
class CompositeLeaderboard {
    /**
     * 构造函数
     * @param {RedisClient} redis - Redis客户端实例
     * @param {string} compositeKey - 综合排行榜的键
     */
    constructor(redis, compositeKey) {
        this.redis = redis;
        this.leaderboards = {};
        this.ratingSystems = {};
        this.compositeKey = compositeKey;
    }
    /**
     * 获取排行榜键
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {string} 排行榜键
     */
    getLeaderboardKey(baseKey, period) {
        return `${baseKey}:${period}`;
    }
    /**
     * 获取排行榜实例
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {Leaderboard} 排行榜实例
     */
    getLeaderboard(baseKey, period) {
        const key = this.getLeaderboardKey(baseKey, period);
        if (!this.leaderboards[key]) {
            this.leaderboards[key] = new Leaderboard_1.Leaderboard(this.redis, key);
        }
        return this.leaderboards[key];
    }
    /**
     * 获取评分系统键
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {string} 评分系统键
     */
    getRatingSystemKey(baseKey, period) {
        return `${baseKey}:${period}`;
    }
    /**
     * 获取评分系统实例
     * @param {string} baseKey - 基础键
     * @param {string} period - 时间段
     * @returns {RatingSystem} 评分系统实例
     */
    getRatingSystem(baseKey, period) {
        const key = this.getRatingSystemKey(baseKey, period);
        if (!this.ratingSystems[key]) {
            this.ratingSystems[key] = new RatingSystem_1.RatingSystem(this.redis, key);
        }
        return this.ratingSystems[key];
    }
    /**
     * 添加用户积分
     * @param {string} userId - 用户ID
     * @param {number} score - 积分
     * @param {string} date - 日期
     */
    async addScore(userId, score, date) {
        const leaderboard = this.getLeaderboard(this.compositeKey, date);
        await leaderboard.addUser(userId, score);
    }
    /**
     * 添加用户评分
     * @param {string} itemId - 项目ID
     * @param {number} score - 评分
     * @param {string} date - 日期
     */
    async addRating(itemId, score, date) {
        const ratingSystem = this.getRatingSystem(this.compositeKey, date);
        await ratingSystem.addRating(itemId, score);
    }
    /**
     * 获取用户综合排名及评分
     * @param {string} userId - 用户ID
     * @param {string} date - 日期
     * @returns {Promise<{rank: number, score: number}>} 用户的综合排名及评分
     */
    async getCompositeRank(userId, date) {
        const leaderboard = this.getLeaderboard(this.compositeKey, date);
        const ratingSystem = this.getRatingSystem(this.compositeKey, date);
        const userRank = await leaderboard.getUserRank(userId);
        const userRating = await ratingSystem.getRating(userId);
        // 检查 userRank 和 userRating 是否为 null
        const rankScore = userRank?.score ?? 0;
        const ratingScore = userRating ?? 0;
        // 综合评分计算方式：积分 * 权重1 + 评分 * 权重2
        const compositeScore = rankScore * 0.7 + ratingScore * 0.3;
        return { rank: userRank?.rank ?? -1, score: compositeScore };
    }
    /**
     * 获取前N名用户及其综合评分
     * @param {number} n - 用户数量
     * @param {string} date - 日期
     * @returns {Promise<Array<{member: string, score: number}>>} 前N名用户及其综合评分
     */
    async getTopCompositeUsers(n, date) {
        const leaderboard = this.getLeaderboard(this.compositeKey, date);
        const topUsers = await leaderboard.getTopUsers(n);
        const compositeScores = await Promise.all(topUsers.map(async (user) => {
            const rating = await this.getRatingSystem(this.compositeKey, date).getRating(user.value);
            const ratingScore = rating ?? 0;
            return {
                member: user.value,
                score: user.score * 0.7 + ratingScore * 0.3, // 综合评分计算方式
            };
        }));
        compositeScores.sort((a, b) => b.score - a.score); // 按综合评分排序
        return compositeScores;
    }
}
exports.CompositeLeaderboard = CompositeLeaderboard;
