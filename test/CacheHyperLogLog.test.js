"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const HyperLogLog_1 = require("../src/TSRedisCacheKit/HyperLogLog");
// Mock ioredis
jest.mock("ioredis", () => {
    return {
        Redis: jest.fn().mockImplementation(() => ({
            pfadd: jest.fn(),
            pfcount: jest.fn(),
            pfmerge: jest.fn(),
            del: jest.fn(),
            rename: jest.fn(),
            memory: jest.fn(),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
describe("CacheHyperLogLog", () => {
    let cacheHyperLogLog;
    let redisClient;
    const cacheOption = { appName: "testApp", funcName: "testFunc" };
    beforeEach(() => {
        redisClient = new MockRedisClient();
        cacheHyperLogLog = new HyperLogLog_1.CacheHyperLogLog("testPrefix", cacheOption, redisClient);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should add elements to HyperLogLog", async () => {
        redisClient.pfadd.mockResolvedValue(1);
        const result = await cacheHyperLogLog.add("suffix", "value1", "value2");
        const key = cacheHyperLogLog.createKey("suffix");
        expect(redisClient.pfadd).toHaveBeenCalledWith(key, "value1", "value2");
        expect(result).toBe(true);
    });
    test("should get the count of HyperLogLog", async () => {
        redisClient.pfcount.mockResolvedValue(2);
        const result = await cacheHyperLogLog.count("suffix");
        const key = cacheHyperLogLog.createKey("suffix");
        expect(redisClient.pfcount).toHaveBeenCalledWith(key);
        expect(result).toBe(2);
    });
    test("should merge multiple HyperLogLogs", async () => {
        redisClient.pfmerge.mockResolvedValue("OK");
        const result = await cacheHyperLogLog.merge("suffix", "key1", "key2");
        const key = cacheHyperLogLog.createKey("suffix");
        expect(redisClient.pfmerge).toHaveBeenCalledWith(key, "testPrefix-key1", "testPrefix-key2");
        expect(result).toBe(true);
    });
    test("should delete HyperLogLog", async () => {
        redisClient.del.mockResolvedValue(1);
        const result = await cacheHyperLogLog.delete("suffix");
        const key = cacheHyperLogLog.createKey("suffix");
        expect(redisClient.del).toHaveBeenCalledWith(key);
        expect(result).toBe(true);
    });
    test("should rename HyperLogLog", async () => {
        redisClient.rename.mockResolvedValue("OK");
        const result = await cacheHyperLogLog.rename("oldSuffix", "newSuffix");
        const oldKey = cacheHyperLogLog.createKey("oldSuffix");
        const newKey = cacheHyperLogLog.createKey("newSuffix");
        expect(redisClient.rename).toHaveBeenCalledWith(oldKey, newKey);
        expect(result).toBe(true);
    });
    test("should get memory usage of HyperLogLog", async () => {
        redisClient.memory.mockResolvedValue(1024);
        const result = await cacheHyperLogLog.memoryUsage("suffix");
        const key = cacheHyperLogLog.createKey("suffix");
        expect(redisClient.memory).toHaveBeenCalledWith("USAGE", key);
        expect(result).toBe(1024);
    });
});
