"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubRedis = void 0;
const base_1 = require("./base");
const fs_1 = require("fs");
const path = __importStar(require("path"));
class PubSubRedis extends base_1.BaseCache {
    constructor(prefix, option, redisClient, isPersistent = false, filePath = path.join(process.cwd(), "data") // 默认文件路径为当前项目目录的data文件夹
    ) {
        super(prefix, option, redisClient);
        this.listeners = new Map();
        this.filePath = filePath;
        this.isPersistent = isPersistent;
        this.subscriber = redisClient.duplicate();
        this.subscriber.on("error", (err) => console.error(err));
        // 监听消息事件
        this.subscriber.on("message", (channel, message) => {
            const listener = this.listeners.get(channel);
            if (listener) {
                listener(message, channel);
            }
        });
        // 监听模式消息事件
        this.subscriber.on("pmessage", (pattern, channel, message) => {
            const listener = this.listeners.get(pattern);
            if (listener) {
                listener(message, channel);
            }
        });
        // 自动重连
        this.subscriber.on("end", () => {
            console.log("Redis subscriber disconnected, attempting to reconnect...");
            this.subscriber.connect();
        });
    }
    async subscribe(channel, listener) {
        const key = this.createKey(channel);
        this.listeners.set(key, listener);
        try {
            await this.subscriber.subscribe(key);
        }
        catch (err) {
            console.error(`Failed to subscribe to channel: ${key}`, err);
            throw err;
        }
    }
    async unsubscribe(channel) {
        const key = this.createKey(channel);
        this.listeners.delete(key);
        try {
            await this.subscriber.unsubscribe(key);
        }
        catch (err) {
            console.error(`Failed to unsubscribe from channel: ${key}`, err);
            throw err;
        }
    }
    async psubscribe(pattern, listener) {
        const key = this.createKey(pattern);
        this.listeners.set(key, listener);
        try {
            await this.subscriber.psubscribe(key);
        }
        catch (err) {
            console.error(`Failed to psubscribe to pattern: ${key}`, err);
            throw err;
        }
    }
    async punsubscribe(pattern) {
        const key = this.createKey(pattern);
        this.listeners.delete(key);
        try {
            await this.subscriber.punsubscribe(key);
        }
        catch (err) {
            console.error(`Failed to punsubscribe from pattern: ${key}`, err);
            throw err;
        }
    }
    async publish(channel, message) {
        try {
            await this.redis.publish(this.createKey(channel), message);
        }
        catch (err) {
            console.error(`Failed to publish message: ${message} to channel: ${this.createKey(channel)}`, err);
            throw err;
        }
    }
    async persistMessage(channel, message, fileName) {
        if (!this.isPersistent)
            return;
        const filePath = path.join(this.filePath, `${fileName || this.createKey(channel)}.log`);
        try {
            await fs_1.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs_1.promises.appendFile(filePath, `${new Date().toISOString()} - ${message}\n`);
        }
        catch (err) {
            console.error(`Failed to persist message: ${message}`, err);
            throw err;
        }
    }
    async retryMessage(channel, message, retryCount = 3) {
        if (!this.isPersistent)
            return;
        for (let i = 0; i < retryCount; i++) {
            try {
                console.log(`Attempt ${i + 1} to send message: ${message}`);
                const listener = this.listeners.get(this.createKey(channel));
                if (listener) {
                    listener(message, channel);
                    if (i > 0) {
                        console.log(`Retry ${i + 1} succeeded for message: ${message}`);
                    }
                    break;
                }
            }
            catch (err) {
                console.error(`Retry ${i + 1} failed for message: ${message}`);
                if (i === retryCount - 1) {
                    console.error(`Failed to process message after ${retryCount} attempts: ${message}`);
                }
            }
        }
    }
    async close() {
        await this.subscriber.quit();
    }
}
exports.PubSubRedis = PubSubRedis;
