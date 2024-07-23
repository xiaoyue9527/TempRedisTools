"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const List_1 = require("../src/TSRedisCacheKit/List");
// Mock ioredis
jest.mock("ioredis", () => {
    return {
        Redis: jest.fn().mockImplementation(() => ({
            rpush: jest.fn(),
            rpop: jest.fn(),
            llen: jest.fn(),
            lrange: jest.fn(),
            lpush: jest.fn(),
            lpop: jest.fn(),
            ltrim: jest.fn(),
            lset: jest.fn(),
            lrem: jest.fn(),
            linsert: jest.fn(),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
describe("CacheList", () => {
    let cacheList;
    let redisClient;
    const cacheOption = { appName: "testApp", funcName: "testFunc" };
    beforeEach(() => {
        redisClient = new MockRedisClient();
        cacheList = new List_1.CacheList("testPrefix", cacheOption, redisClient);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should push elements to the list", async () => {
        redisClient.rpush.mockResolvedValue(3);
        const result = await cacheList.push("suffix", "value1", "value2", "value3");
        const key = cacheList.createKey("suffix");
        expect(redisClient.rpush).toHaveBeenCalledWith(key, "value1", "value2", "value3");
        expect(result).toBe(3);
    });
    test("should pop element from the list", async () => {
        redisClient.rpop.mockResolvedValue("value1");
        const result = await cacheList.pop("suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.rpop).toHaveBeenCalledWith(key);
        expect(result).toBe("value1");
    });
    test("should get the length of the list", async () => {
        redisClient.llen.mockResolvedValue(3);
        const result = await cacheList.length("suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.llen).toHaveBeenCalledWith(key);
        expect(result).toBe(3);
    });
    test("should get elements in the specified range", async () => {
        redisClient.lrange.mockResolvedValue(["value1", "value2"]);
        const result = await cacheList.range(0, 1, "suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.lrange).toHaveBeenCalledWith(key, 0, 1);
        expect(result).toEqual(["value1", "value2"]);
    });
    test("should push elements to the left of the list", async () => {
        redisClient.lpush.mockResolvedValue(3);
        const result = await cacheList.lpush("suffix", "value1", "value2", "value3");
        const key = cacheList.createKey("suffix");
        expect(redisClient.lpush).toHaveBeenCalledWith(key, "value1", "value2", "value3");
        expect(result).toBe(3);
    });
    test("should pop element from the left of the list", async () => {
        redisClient.lpop.mockResolvedValue("value1");
        const result = await cacheList.lpop("suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.lpop).toHaveBeenCalledWith(key);
        expect(result).toBe("value1");
    });
    test("should trim the list to the specified range", async () => {
        redisClient.ltrim.mockResolvedValue("OK");
        const result = await cacheList.trim(0, 1, "suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.ltrim).toHaveBeenCalledWith(key, 0, 1);
        expect(result).toBe("OK");
    });
    test("should set the value at the specified index", async () => {
        redisClient.lset.mockResolvedValue("OK");
        const result = await cacheList.set(0, "newValue", "suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.lset).toHaveBeenCalledWith(key, 0, "newValue");
        expect(result).toBe("OK");
    });
    test("should remove elements by value", async () => {
        redisClient.lrem.mockResolvedValue(2);
        const result = await cacheList.remove(2, "value", "suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.lrem).toHaveBeenCalledWith(key, 2, "value");
        expect(result).toBe(2);
    });
    test("should insert element before the pivot", async () => {
        redisClient.linsert.mockResolvedValue(4);
        const result = await cacheList.insert("pivot", "newValue", "BEFORE", "suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.linsert).toHaveBeenCalledWith(key, "BEFORE", "pivot", "newValue");
        expect(result).toBe(4);
    });
    test("should insert element after the pivot", async () => {
        redisClient.linsert.mockResolvedValue(4);
        const result = await cacheList.insert("pivot", "newValue", "AFTER", "suffix");
        const key = cacheList.createKey("suffix");
        expect(redisClient.linsert).toHaveBeenCalledWith(key, "AFTER", "pivot", "newValue");
        expect(result).toBe(4);
    });
});
