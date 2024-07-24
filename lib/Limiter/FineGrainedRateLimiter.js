"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FineGrainedRateLimiter = void 0;
const time_1 = require("../tools/time");
const List_1 = require("../TSRedisCacheKit/List");
// 细粒度限流器类
class FineGrainedRateLimiter extends List_1.CacheList {
    /**
     * 创建一个细粒度限流器实例
     * @param redisConfig Redis 配置
     * @param limitOption 限流项的配置数组
     */
    constructor(redisConfig, limitOption) {
        super(redisConfig.prefix, redisConfig.option, redisConfig.redisClient);
        this.limitOption = limitOption;
        this.limitOption.sort((a, b) => b.limit - a.limit);
        this.maxListLength = this.limitOption[0].limit + 20;
    }
    async add(key, timestamp = Date.now().toString()) {
        await this.push(key, timestamp);
    }
    /**
     * 判断指定键是否受到限流
     * @param key 要进行限流检查的键
     * @returns 如果未受限流，则返回 { status: true }；如果受限流，则返回 { status: false, msg: 错误消息 }
     */
    async isRateLimited(key) {
        await this.handleListLength(key);
        const length = await this.length(key);
        const max = this.limitOption[0]?.limit;
        const list = await this.range(length - max, length, key);
        list.reverse();
        // 创建通过时间单位到限制数目和计数的字典
        const passDict = {};
        this.limitOption.forEach((i) => {
            passDict[(0, time_1.convertUnitToSeconds)(i.unit)] = {
                ...i,
                count: 0,
            };
        });
        return this.baggingCount(list, passDict);
    }
    /**
     * 对列表进行限流计数
     * @param list 时间戳列表，用于限流计数
     * @param passDict 通过时间单位到限制数目和计数的字典
     * @returns 如果未受限流，则返回 { status: true }；如果受限流，则返回 { status: false, msg: 错误消息 }
     */
    baggingCount(list, passDict) {
        for (const i in list) {
            const now = new Date().getTime();
            const differ = (now - Number(list[i])) / 1000;
            // 遍历通过时间单位字典，检查是否超过限制
            for (const unit in passDict) {
                if (Number(unit) > differ) {
                    passDict[unit].count++;
                    if (passDict[unit].count >= passDict[unit].limit) {
                        const msg = `触发${passDict[unit].name} ${unit} ${passDict[unit].limit} last`;
                        console.log(new Date(), msg, new Date(Number(list[i])));
                        return {
                            status: true,
                            msg: `${msg} ${new Date(Number(list[i]))}`,
                        };
                    }
                }
            }
        }
        return {
            status: false,
        };
    }
    /**
     * 处理列表长度，如果列表长度超过最大限制，则删除多余的元素
     * @param key 列表的键
     */
    async handleListLength(key) {
        const length = await this.length(key);
        if (length > this.maxListLength) {
            const deleteCount = length - this.maxListLength;
            await this.redis.ltrim(this.createKey(key), deleteCount, -1);
            console.log(`handleListLength key: ${key} length: ${deleteCount} current: ${length - deleteCount}`);
        }
    }
}
exports.FineGrainedRateLimiter = FineGrainedRateLimiter;
