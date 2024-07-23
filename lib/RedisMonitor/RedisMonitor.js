"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisMonitor = void 0;
class RedisMonitor {
    constructor(redisClient) {
        this.intervalId = null;
        this.redis = redisClient;
    }
    /**
     * 启动监控
     * @param interval - 监控间隔时间（毫秒）
     * @param callback - 监控回调函数
     */
    startMonitoring(interval, callback) {
        if (this.intervalId !== null) {
            console.warn("Monitoring is already running.");
            return;
        }
        this.intervalId = setInterval(async () => {
            try {
                const info = await this.redis.info();
                callback(info);
            }
            catch (error) {
                console.error("Error fetching Redis info:", error);
            }
        }, interval);
    }
    /**
     * 停止监控
     */
    stopMonitoring() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        else {
            console.warn("Monitoring is not running.");
        }
    }
}
exports.RedisMonitor = RedisMonitor;
