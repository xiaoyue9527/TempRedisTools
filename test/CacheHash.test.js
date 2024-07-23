"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const Hash_1 = require("../src/TSRedisCacheKit/Hash");
// Mock ioredis
jest.mock("ioredis", () => {
    return {
        Redis: jest.fn().mockImplementation(() => ({
            hset: jest.fn(),
            hget: jest.fn(),
            hgetall: jest.fn(),
            hexists: jest.fn(),
            hdel: jest.fn(),
            hlen: jest.fn(),
            hkeys: jest.fn(),
            hvals: jest.fn(),
            hincrby: jest.fn(),
            hincrbyfloat: jest.fn(),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
describe("CacheHash", () => {
    let cacheHash;
    let redisClient;
    const cacheOption = { appName: "testApp", funcName: "testFunc" };
    beforeEach(() => {
        redisClient = new MockRedisClient();
        cacheHash = new Hash_1.CacheHash("testPrefix", cacheOption, redisClient);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should set hash field value", async () => {
        redisClient.hset.mockResolvedValue(1);
        const result = await cacheHash.set("field", { key: "value" }, "suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hset).toHaveBeenCalledWith(key, "field", JSON.stringify({ key: "value" }));
        expect(result).toBe(true);
    });
    test("should get hash field value", async () => {
        redisClient.hget.mockResolvedValue(JSON.stringify({ key: "value" }));
        const result = await cacheHash.get("field", "suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hget).toHaveBeenCalledWith(key, "field");
        expect(result).toEqual({ key: "value" });
    });
    test("should get all fields and values from hash", async () => {
        redisClient.hgetall.mockResolvedValue({
            field1: JSON.stringify({ key1: "value1" }),
            field2: JSON.stringify({ key2: "value2" }),
        });
        const result = await cacheHash.getAll("suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hgetall).toHaveBeenCalledWith(key);
        expect(result).toEqual({
            field1: { key1: "value1" },
            field2: { key2: "value2" },
        });
    });
    test("should check if hash field exists", async () => {
        redisClient.hexists.mockResolvedValue(1);
        const result = await cacheHash.exists("field", "suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hexists).toHaveBeenCalledWith(key, "field");
        expect(result).toBe(1);
    });
    test("should delete hash field", async () => {
        redisClient.hdel.mockResolvedValue(1);
        const result = await cacheHash.delete("field", "suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hdel).toHaveBeenCalledWith(key, "field");
        expect(result).toBe(true);
    });
    test("should get length of hash", async () => {
        redisClient.hlen.mockResolvedValue(2);
        const result = await cacheHash.length("suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hlen).toHaveBeenCalledWith(key);
        expect(result).toBe(2);
    });
    test("should get all keys from hash", async () => {
        redisClient.hkeys.mockResolvedValue(["field1", "field2"]);
        const result = await cacheHash.keys("suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hkeys).toHaveBeenCalledWith(key);
        expect(result).toEqual(["field1", "field2"]);
    });
    test("should get all values from hash", async () => {
        redisClient.hvals.mockResolvedValue([
            JSON.stringify({ key1: "value1" }),
            JSON.stringify({ key2: "value2" }),
        ]);
        const result = await cacheHash.values("suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hvals).toHaveBeenCalledWith(key);
        expect(result).toEqual([{ key1: "value1" }, { key2: "value2" }]);
    });
    test("should increment hash field by integer", async () => {
        redisClient.hincrby.mockResolvedValue(5);
        const result = await cacheHash.incrementBy("field", 3, "suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hincrby).toHaveBeenCalledWith(key, "field", 3);
        expect(result).toBe(5);
    });
    test("should increment hash field by float", async () => {
        redisClient.hincrbyfloat.mockResolvedValue("5.5");
        const result = await cacheHash.incrementByFloat("field", 2.5, "suffix");
        const key = cacheHash.createKey("suffix");
        expect(redisClient.hincrbyfloat).toHaveBeenCalledWith(key, "field", 2.5);
        expect(result).toBe("5.5");
    });
});
