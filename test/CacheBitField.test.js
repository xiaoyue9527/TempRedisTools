"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const BitField_1 = require("../src/TSRedisCacheKit/BitField");
// Mock ioredis
jest.mock("ioredis", () => {
    return {
        Redis: jest.fn().mockImplementation(() => ({
            setbit: jest.fn(),
            getbit: jest.fn(),
            bitcount: jest.fn(),
            bitop: jest.fn(),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
describe("CacheBitField", () => {
    let cacheBitField;
    let redisClient;
    const cacheOption = { appName: "testApp", funcName: "testFunc" };
    beforeEach(() => {
        redisClient = new MockRedisClient();
        cacheBitField = new BitField_1.CacheBitField("testPrefix", cacheOption, redisClient);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should set a bit at offset", async () => {
        redisClient.setbit.mockResolvedValue(0);
        const result = await cacheBitField.setbit(5, true, "suffix");
        const key = cacheBitField.createKey("suffix");
        expect(redisClient.setbit).toHaveBeenCalledWith(key, 5, 1);
        expect(result).toBe(false);
    });
    test("should get a bit at offset", async () => {
        redisClient.getbit.mockResolvedValue(1);
        const result = await cacheBitField.getbit(5, "suffix");
        const key = cacheBitField.createKey("suffix");
        expect(redisClient.getbit).toHaveBeenCalledWith(key, 5);
        expect(result).toBe(1);
    });
    test("should count bits in range with BYTE mode", async () => {
        redisClient.bitcount.mockResolvedValue(5);
        const option = { start: 0, end: 10, mode: "BYTE" };
        const result = await cacheBitField.count(option, "suffix");
        const key = cacheBitField.createKey("suffix");
        expect(redisClient.bitcount).toHaveBeenCalledWith(key, 0, 10, "BYTE");
        expect(result).toBe(5);
    });
    test("should count bits in range with BIT mode", async () => {
        redisClient.bitcount.mockResolvedValue(3);
        const option = { start: 0, end: 10, mode: "BIT" };
        const result = await cacheBitField.count(option, "suffix");
        const key = cacheBitField.createKey("suffix");
        expect(redisClient.bitcount).toHaveBeenCalledWith(key, 0, 10, "BIT");
        expect(result).toBe(3);
    });
    test("should count bits in range without mode", async () => {
        redisClient.bitcount.mockResolvedValue(7);
        const option = { start: 0, end: 10 };
        const result = await cacheBitField.count(option, "suffix");
        const key = cacheBitField.createKey("suffix");
        expect(redisClient.bitcount).toHaveBeenCalledWith(key, 0, 10);
        expect(result).toBe(7);
    });
    test("should perform bit operation", async () => {
        redisClient.bitop.mockResolvedValue(10);
        const result = await cacheBitField.bitop("AND", "destKey", [
            "key1",
            "key2",
        ]);
        const key1 = cacheBitField.createKey("key1");
        const key2 = cacheBitField.createKey("key2");
        expect(redisClient.bitop).toHaveBeenCalledWith("AND", "destKey", key1, key2);
        expect(result).toBe(10);
    });
});
