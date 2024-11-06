import { CacheOption } from "../type";
import { BaseCache } from "./base";
import { Redis as RedisClient } from "ioredis";
import { promises as fs } from "fs";
import * as path from "path";

export class PubSubRedis extends BaseCache {
  private subscriber: RedisClient;
  private listeners = new Map<
    string,
    (message: string, channel: string) => void
  >();
  private filePath: string;
  private isPersistent: boolean;

  constructor(
    prefix: string,
    option: CacheOption,
    redisClient: RedisClient,
    isPersistent: boolean = false,
    filePath: string = path.join(process.cwd(), "data") // 默认文件路径为当前项目目录的data文件夹

  ) {
    super(prefix, option, redisClient);
    this.filePath = filePath;
    this.isPersistent = isPersistent
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

  async subscribe(
    channel: string,
    listener: (message: string, channel: string) => void
  ): Promise<void> {
    const key = this.createKey(channel);
    this.listeners.set(key, listener);
    try {
      await this.subscriber.subscribe(key);
    } catch (err) {
      console.error(`Failed to subscribe to channel: ${key}`, err);
      throw err;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    const key = this.createKey(channel);
    this.listeners.delete(key);
    try {
      await this.subscriber.unsubscribe(key);
    } catch (err) {
      console.error(`Failed to unsubscribe from channel: ${key}`, err);
      throw err;
    }
  }

  async psubscribe(
    pattern: string,
    listener: (message: string, channel: string) => void
  ): Promise<void> {
    const key = this.createKey(pattern);
    this.listeners.set(key, listener);
    try {
      await this.subscriber.psubscribe(key);
    } catch (err) {
      console.error(`Failed to psubscribe to pattern: ${key}`, err);
      throw err;
    }
  }

  async punsubscribe(pattern: string): Promise<void> {
    const key = this.createKey(pattern);
    this.listeners.delete(key);
    try {
      await this.subscriber.punsubscribe(key);
    } catch (err) {
      console.error(`Failed to punsubscribe from pattern: ${key}`, err);
      throw err;
    }
  }

  async publish(channel: string, message: string | Buffer): Promise<void> {
    try {
      await this.redis.publish(this.createKey(channel), message);
    } catch (err) {
      console.error(
        `Failed to publish message: ${message} to channel: ${this.createKey(
          channel
        )}`,
        err
      );
      throw err;
    }
  }

  async persistMessage(
    channel: string,
    message: string,
    fileName?: string
  ): Promise<void> {
    if (!this.isPersistent) return
    const filePath = path.join(
      this.filePath,
      `${fileName || this.createKey(channel)}.log`
    );
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.appendFile(
        filePath,
        `${new Date().toISOString()} - ${message}\n`
      );
    } catch (err) {
      console.error(`Failed to persist message: ${message}`, err);
      throw err;
    }
  }

  async retryMessage(
    channel: string,
    message: string,
    retryCount: number = 3
  ): Promise<void> {
    if (!this.isPersistent) return
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
      } catch (err) {
        console.error(`Retry ${i + 1} failed for message: ${message}`);
        if (i === retryCount - 1) {
          console.error(
            `Failed to process message after ${retryCount} attempts: ${message}`
          );
        }
      }
    }
  }

  async close(): Promise<void> {
    await this.subscriber.quit();
  }
}
