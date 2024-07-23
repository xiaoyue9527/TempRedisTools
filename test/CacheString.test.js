"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const String_1 = require("../src/TSRedisCacheKit/String");
const ioredis_1 = require("ioredis");
// Mock ioredis
jest.mock("ioredis", () => {
    return {
        Redis: jest.fn().mockImplementation(() => ({
            set: jest.fn().mockResolvedValue("OK"),
            get: jest.fn().mockResolvedValue("value"),
            exists: jest.fn().mockResolvedValue(1),
            del: jest.fn().mockResolvedValue(1),
            incrby: jest.fn().mockResolvedValue(1),
            decrby: jest.fn().mockResolvedValue(1),
            getset: jest.fn().mockResolvedValue("oldValue"),
            mset: jest.fn().mockResolvedValue("OK"),
            mget: jest.fn().mockResolvedValue(["value1", "value2"]),
            setnx: jest.fn().mockResolvedValue(1),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
describe("CacheString", () => {
    let cacheString;
    let redisClient;
    const cacheOption = { appName: "testApp", funcName: "testFunc" };
    beforeEach(() => {
        redisClient = new MockRedisClient();
        cacheString = new String_1.CacheString("testPrefix", cacheOption, redisClient);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should set a string value", async () => {
        const result = await cacheString.set("key", "value");
        expect(redisClient.set).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key", "value");
        expect(result).toBe("OK");
    });
    test("should set a string value with expiration", async () => {
        const result = await cacheString.set("key", "value", 10);
        expect(redisClient.set).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key", "value", "EX", 10);
        expect(result).toBe("OK");
    });
    test("should get a string value", async () => {
        const result = await cacheString.get("key");
        expect(redisClient.get).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key");
        expect(result).toBe("value");
    });
    test("should check if a key exists", async () => {
        const result = await cacheString.exists("key");
        expect(redisClient.exists).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key");
        expect(result).toBe(1);
    });
    test("should delete a key", async () => {
        const result = await cacheString.delete("key");
        expect(redisClient.del).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key");
        expect(result).toBe(1);
    });
    test("should increment a key's value", async () => {
        const result = await cacheString.increment("key", 2);
        expect(redisClient.incrby).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key", 2);
        expect(result).toBe(1);
    });
    test("should decrement a key's value", async () => {
        const result = await cacheString.decrement("key", 2);
        expect(redisClient.decrby).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key", 2);
        expect(result).toBe(1);
    });
    test("should get and set a new value", async () => {
        const result = await cacheString.getSet("key", "newValue");
        expect(redisClient.getset).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key", "newValue");
        expect(result).toBe("oldValue");
    });
    test("should set multiple key-value pairs", async () => {
        const result = await cacheString.setMultiple([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
        ]);
        expect(redisClient.mset).toHaveBeenCalledWith([
            "testPrefix-testApp-testFunc-key1",
            "value1",
            "testPrefix-testApp-testFunc-key2",
            "value2",
        ]);
        expect(result).toBe("OK");
    });
    test("should get multiple key-value pairs", async () => {
        const result = await cacheString.getMultiple(["key1", "key2"]);
        expect(redisClient.mget).toHaveBeenCalledWith([
            "testPrefix-testApp-testFunc-key1",
            "testPrefix-testApp-testFunc-key2",
        ]);
        expect(result).toEqual(["value1", "value2"]);
    });
    test("should set key-value pair if key does not exist", async () => {
        const result = await cacheString.setnx("key", "value");
        expect(redisClient.setnx).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key", "value");
        expect(result).toBe(1);
    });
    test("should set key-value pair with expiration if key does not exist", async () => {
        const result = await cacheString.setnxWithExpire("key", "value", 10);
        expect(redisClient.set).toHaveBeenCalledWith("testPrefix-testApp-testFunc-key", "value", "EX", 10, "NX");
        expect(result).toBe("OK");
    });
});
