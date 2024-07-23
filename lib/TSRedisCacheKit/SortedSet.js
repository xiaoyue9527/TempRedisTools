"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheSortedSet = void 0;
const base_1 = require("./base");
class CacheSortedSet extends base_1.BaseCache {
    /**
     * 添加一个成员到有序集合
     * @param score - 成员的分数
     * @param value - 成员的值
     * @param suffix - 可选的键后缀
     * @returns 是否成功添加
     */
    async add(score, value, suffix = "") {
        const result = await this.redis.zadd(this.createKey(suffix), score, this.dataToString(value));
        return result > 0;
    }
    /**
     * 添加多个成员到有序集合
     * @param members - 成员数组
     * @param suffix - 可选的键后缀
     * @returns 是否成功添加
     */
    async adds(members, suffix = "") {
        const args = members.flatMap((member) => [
            member.score,
            this.dataToString(member.value),
        ]);
        const result = await this.redis.zadd(this.createKey(suffix), ...args);
        return result > 0;
    }
    /**
     * 移除有序集合中的一个成员
     * @param value - 成员的值
     * @param suffix - 可选的键后缀
     * @returns 是否成功移除
     */
    async remove(value, suffix = "") {
        const result = await this.redis.zrem(this.createKey(suffix), this.dataToString(value));
        return result > 0;
    }
    /**
     * 计算有序集合中指定分数范围的成员数量
     * @param min - 最小分数
     * @param max - 最大分数
     * @param suffix - 可选的键后缀
     * @returns 成员数量
     */
    async count(min, max, suffix = "") {
        return await this.redis.zcount(this.createKey(suffix), min, max);
    }
    /**
     * 获取有序集合中指定分数范围的成员
     * @param min - 最小分数
     * @param max - 最大分数
     * @param suffix - 可选的键后缀
     * @returns 成员数组
     */
    async rangeByScore(min, max, suffix = "") {
        return await this.redis.zrangebyscore(this.createKey(suffix), min, max);
    }
    /**
     * 获取有序集合中的元素数量
     * @param suffix - 可选的键后缀
     * @returns 元素数量
     */
    async length(suffix = "") {
        return await this.redis.zcard(this.createKey(suffix));
    }
    /**
     * 获取有序集合中指定范围内的元素
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 元素数组
     */
    async range(start, stop, suffix = "") {
        return await this.redis.zrange(this.createKey(suffix), start, stop);
    }
    /**
     * 获取有序集合中指定范围内的元素及其分数
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 元素及其分数数组
     */
    async rangeWithScores(start, stop, suffix = "") {
        const result = await this.redis.zrange(this.createKey(suffix), start, stop, "WITHSCORES");
        const members = [];
        for (let i = 0; i < result.length; i += 2) {
            const value = result[i];
            const score = parseFloat(result[i + 1]);
            if (!isNaN(score)) {
                members.push({ value, score });
            }
            else {
                console.error(`Failed to parse score for value: ${value}`);
            }
        }
        return members;
    }
    /**
     * 获取有序集合中指定成员的分数
     * @param value - 成员的值
     * @param suffix - 可选的键后缀
     * @returns 成员的分数
     */
    async score(value, suffix = "") {
        const result = await this.redis.zscore(this.createKey(suffix), this.dataToString(value));
        return result ? parseFloat(result) : null;
    }
    /**
     * 为有序集合中的成员的分数加上指定增量
     * @param value - 成员的值
     * @param increment - 增量
     * @param suffix - 可选的键后缀
     * @returns 增加后的分数
     */
    async incrementBy(value, increment, suffix = "") {
        return await this.redis.zincrby(this.createKey(suffix), increment, this.dataToString(value));
    }
    /**
     * 删除有序集合中指定分数范围的成员
     * @param min - 最小分数
     * @param max - 最大分数
     * @param suffix - 可选的键后缀
     * @returns 删除的成员数量
     */
    async removeRangeByScore(min, max, suffix = "") {
        return await this.redis.zremrangebyscore(this.createKey(suffix), min, max);
    }
    /**
     * 删除有序集合中指定排名范围的成员
     * @param start - 起始索引
     * @param stop - 结束索引
     * @param suffix - 可选的键后缀
     * @returns 删除的成员数量
     */
    async removeRangeByRank(start, stop, suffix = "") {
        return await this.redis.zremrangebyrank(this.createKey(suffix), start, stop);
    }
}
exports.CacheSortedSet = CacheSortedSet;
