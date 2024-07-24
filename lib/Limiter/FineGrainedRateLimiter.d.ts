import { CacheList } from "../TSRedisCacheKit/List";
import { LimiterPassDict, LimitItemConfig, RedisConfig } from "../type";
export declare class FineGrainedRateLimiter extends CacheList {
    limitOption: LimitItemConfig[];
    maxListLength: number;
    /**
     * 创建一个细粒度限流器实例
     * @param redisConfig Redis 配置
     * @param limitOption 限流项的配置数组
     */
    constructor(redisConfig: RedisConfig, limitOption: LimitItemConfig[]);
    add(key: string, timestamp?: string): Promise<void>;
    /**
     * 判断指定键是否受到限流
     * @param key 要进行限流检查的键
     * @returns 如果未受限流，则返回 { status: true }；如果受限流，则返回 { status: false, msg: 错误消息 }
     */
    isRateLimited(key: string): Promise<{
        status: boolean;
        msg?: string;
    }>;
    /**
     * 对列表进行限流计数
     * @param list 时间戳列表，用于限流计数
     * @param passDict 通过时间单位到限制数目和计数的字典
     * @returns 如果未受限流，则返回 { status: true }；如果受限流，则返回 { status: false, msg: 错误消息 }
     */
    baggingCount(list: string[], passDict: LimiterPassDict): {
        status: boolean;
        msg: string;
    } | {
        status: boolean;
        msg?: undefined;
    };
    /**
     * 处理列表长度，如果列表长度超过最大限制，则删除多余的元素
     * @param key 列表的键
     */
    handleListLength(key: string): Promise<void>;
}
