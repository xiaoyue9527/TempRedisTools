import { ChainableCommander, Redis as RedisClient } from "ioredis";
import { CacheOption } from "../type";
/**
 * 基础缓存类
 */
export declare class BaseCache {
    protected option: CacheOption;
    protected redis: RedisClient;
    protected prefix: string;
    /**
     * 构造函数
     * @param prefix - 缓存键前缀
     * @param option - 缓存选项
     * @param redisClient - Redis 客户端实例
     */
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient);
    /**
     * 创建缓存键
     * @param suffix - 可选的键值
     * @returns 生成的缓存键
     */
    createKey(suffix?: string | number | boolean): string;
    /**
     * 将数据转换为字符串
     * @param data - 要转换的数据
     * @returns 转换后的字符串
     */
    protected dataToString(data: any): string;
    /**
     * 创建管道操作
     * @returns 创建的管道实例
     */
    createPipeline(): ChainableCommander;
    /**
     * 执行事务操作
     * @param commands - 包含事务命令的回调函数
     * @returns 事务执行结果的 Promise
     */
    executeTransaction(commands: (pipeline: ChainableCommander) => void): Promise<any>;
}
