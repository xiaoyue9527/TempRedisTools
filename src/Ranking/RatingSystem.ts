import { Redis as RedisClient } from "ioredis";
import { CacheSortedSet } from "../TSRedisCacheKit/SortedSet";

export class RatingSystem {
  private redis: RedisClient;
  private rating: CacheSortedSet;

  /**
   * 构造函数
   * @param {RedisClient} redis - Redis客户端实例
   * @param {string} ratingKey - 评分系统的键
   */
  constructor(redis: RedisClient, ratingKey: string) {
    this.redis = redis;
    this.rating = new CacheSortedSet(
      ratingKey,
      { appName: "app", funcName: "rating" },
      redis
    );
  }

  /**
   * 添加评分
   * @param {string} itemId - 项目ID
   * @param {number} score - 评分
   */
  async addRating(itemId: string, score: number) {
    await this.rating.incrementBy(itemId, score);
  }

  /**
   * 获取评分
   * @param {string} itemId - 项目ID
   * @returns {Promise<number>} 评分
   */
  async getRating(itemId: string) {
    return await this.rating.score(itemId);
  }

  /**
   * 获取排名
   * @param {string} itemId - 项目ID
   * @returns {Promise<number | null>} 排名，若没有找到则返回null
   */
  async getRatingRank(itemId: string) {
    const rank = await this.redis.zrevrank(this.rating.createKey(), itemId);
    return rank;
  }

  /**
   * 实时更新评分
   * @param {string} itemId - 项目ID
   * @param {number} score - 新增的评分
   */
  async updateRating(itemId: string, score: number) {
    await this.rating.incrementBy(itemId, score);
  }
}
