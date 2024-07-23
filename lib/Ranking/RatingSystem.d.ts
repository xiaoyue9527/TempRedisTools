import { Redis as RedisClient } from "ioredis";
export declare class RatingSystem {
    private redis;
    private rating;
    /**
     * 构造函数
     * @param {RedisClient} redis - Redis客户端实例
     * @param {string} ratingKey - 评分系统的键
     */
    constructor(redis: RedisClient, ratingKey: string);
    /**
     * 添加评分
     * @param {string} itemId - 项目ID
     * @param {number} score - 评分
     */
    addRating(itemId: string, score: number): Promise<void>;
    /**
     * 获取评分
     * @param {string} itemId - 项目ID
     * @returns {Promise<number>} 评分
     */
    getRating(itemId: string): Promise<number | null>;
    /**
     * 获取排名
     * @param {string} itemId - 项目ID
     * @returns {Promise<number | null>} 排名，若没有找到则返回null
     */
    getRatingRank(itemId: string): Promise<number | null>;
    /**
     * 实时更新评分
     * @param {string} itemId - 项目ID
     * @param {number} score - 新增的评分
     */
    updateRating(itemId: string, score: number): Promise<void>;
}
