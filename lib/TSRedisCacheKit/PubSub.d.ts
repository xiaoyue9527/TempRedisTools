import { CacheOption } from "../type";
import { BaseCache } from "./base";
import { Redis as RedisClient } from "ioredis";
export declare class PubSubRedis extends BaseCache {
    private subscriber;
    private listeners;
    private filePath;
    constructor(prefix: string, option: CacheOption, redisClient: RedisClient, filePath?: string);
    subscribe(channel: string, listener: (message: string, channel: string) => void): Promise<void>;
    unsubscribe(channel: string): Promise<void>;
    psubscribe(pattern: string, listener: (message: string, channel: string) => void): Promise<void>;
    punsubscribe(pattern: string): Promise<void>;
    publish(channel: string, message: string | Buffer): Promise<void>;
    persistMessage(channel: string, message: string, fileName?: string): Promise<void>;
    retryMessage(channel: string, message: string, retryCount?: number): Promise<void>;
    close(): Promise<void>;
}
