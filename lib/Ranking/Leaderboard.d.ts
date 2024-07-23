import { Redis as RedisClient } from "ioredis";
export declare class Leaderboard {
    private redis;
    private leaderboard;
    /**
     * 构造函数
     * @param {RedisClient} redis - Redis客户端实例
     * @param {string} leaderboardKey - 排行榜的键
     */
    constructor(redis: RedisClient, leaderboardKey: string);
    /**
     * 添加用户及其分数
     * @param {string} userId - 用户ID
     * @param {number} score - 用户分数
     */
    addUser(userId: string, score: number): Promise<void>;
    /**
     * 删除用户
     * @param {string} userId - 用户ID
     */
    removeUser(userId: string): Promise<void>;
    /**
     * 获取用户排名及分数
     * @param {string} userId - 用户ID
     * @returns {Promise<{rank: number, score: number}>} 用户的排名和分数
     */
    getUserRank(userId: string): Promise<{
        rank: number | null;
        score: number | null;
    }>;
    /**
     * 获取前N名用户
     * @param {number} n - 要获取的用户数量
     * @returns {Promise<Array<{member: string, score: number}>>} 前N名用户及其分数
     */
    getTopUsers(n: number): Promise<{
        value: string;
        score: number;
    }[]>;
    /**
     * 实时更新用户分数
     * @param {string} userId - 用户ID
     * @param {number} score - 新增的分数
     */
    updateScore(userId: string, score: number): Promise<void>;
}
