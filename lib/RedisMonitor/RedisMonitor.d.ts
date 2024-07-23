import Redis from "ioredis";
export declare class RedisMonitor {
    private redis;
    private intervalId;
    constructor(redisClient: Redis);
    /**
     * 启动监控
     * @param interval - 监控间隔时间（毫秒）
     * @param callback - 监控回调函数
     */
    startMonitoring(interval: number, callback: (info: string) => void): void;
    /**
     * 停止监控
     */
    stopMonitoring(): void;
}
