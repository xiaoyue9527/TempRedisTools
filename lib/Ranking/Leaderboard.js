"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leaderboard = void 0;
const SortedSet_1 = require("../TSRedisCacheKit/SortedSet");
class Leaderboard {
    /**
     * 构造函数
     * @param {RedisClient} redis - Redis客户端实例
     * @param {string} leaderboardKey - 排行榜的键
     */
    constructor(redis, leaderboardKey) {
        this.redis = redis;
        this.leaderboard = new SortedSet_1.CacheSortedSet(leaderboardKey, { appName: "app", funcName: "leaderboard" }, redis);
    }
    /**
     * 添加用户及其分数
     * @param {string} userId - 用户ID
     * @param {number} score - 用户分数
     */
    async addUser(userId, score) {
        await this.leaderboard.add(score, userId);
    }
    /**
     * 删除用户
     * @param {string} userId - 用户ID
     */
    async removeUser(userId) {
        await this.leaderboard.remove(userId);
    }
    /**
     * 获取用户排名及分数
     * @param {string} userId - 用户ID
     * @returns {Promise<{rank: number, score: number}>} 用户的排名和分数
     */
    async getUserRank(userId) {
        const rank = await this.redis.zrevrank(this.leaderboard.createKey(), userId);
        const score = await this.leaderboard.score(userId);
        return { rank, score };
    }
    /**
     * 获取前N名用户
     * @param {number} n - 要获取的用户数量
     * @returns {Promise<Array<{member: string, score: number}>>} 前N名用户及其分数
     */
    async getTopUsers(n) {
        return await this.leaderboard.rangeWithScores(0, n - 1);
    }
    /**
     * 实时更新用户分数
     * @param {string} userId - 用户ID
     * @param {number} score - 新增的分数
     */
    async updateScore(userId, score) {
        await this.leaderboard.incrementBy(userId, score);
    }
}
exports.Leaderboard = Leaderboard;
