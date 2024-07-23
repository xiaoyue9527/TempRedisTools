import { Redis as RedisClient } from "ioredis";
import { CacheSortedSet } from "../TSRedisCacheKit/SortedSet";

export class Leaderboard {
  private redis: RedisClient;
  private leaderboard: CacheSortedSet;

  /**
   * 构造函数
   * @param {RedisClient} redis - Redis客户端实例
   * @param {string} leaderboardKey - 排行榜的键
   */
  constructor(redis: RedisClient, leaderboardKey: string) {
    this.redis = redis;
    this.leaderboard = new CacheSortedSet(
      leaderboardKey,
      { appName: "app", funcName: "leaderboard" },
      redis
    );
  }

  /**
   * 添加用户及其分数
   * @param {string} userId - 用户ID
   * @param {number} score - 用户分数
   */
  async addUser(userId: string, score: number) {
    await this.leaderboard.add(score, userId);
  }

  /**
   * 删除用户
   * @param {string} userId - 用户ID
   */
  async removeUser(userId: string) {
    await this.leaderboard.remove(userId);
  }

  /**
   * 获取用户排名及分数
   * @param {string} userId - 用户ID
   * @returns {Promise<{rank: number, score: number}>} 用户的排名和分数
   */
  async getUserRank(userId: string) {
    const rank = await this.redis.zrevrank(
      this.leaderboard.createKey(),
      userId
    );
    const score = await this.leaderboard.score(userId);
    return { rank, score };
  }

  /**
   * 获取前N名用户
   * @param {number} n - 要获取的用户数量
   * @returns {Promise<Array<{member: string, score: number}>>} 前N名用户及其分数
   */
  async getTopUsers(n: number) {
    return await this.leaderboard.rangeWithScores(0, n - 1);
  }

  /**
   * 实时更新用户分数
   * @param {string} userId - 用户ID
   * @param {number} score - 新增的分数
   */
  async updateScore(userId: string, score: number) {
    await this.leaderboard.incrementBy(userId, score);
  }
}
