"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../src/TSRedisCacheKit/base");
const ioredis_1 = require("ioredis");
// Mock ioredis
jest.mock("ioredis", () => {
    return {
        Redis: jest.fn().mockImplementation(() => ({
            pipeline: jest.fn().mockImplementation(() => ({
                set: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue("value"),
                exec: jest.fn().mockResolvedValue(["OK"]),
            })),
            multi: jest.fn().mockImplementation(() => ({
                set: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue("value"),
                exec: jest.fn().mockResolvedValue(["OK"]),
            })),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
describe("BaseCache", () => {
    let baseCache;
    let redisClient;
    const cacheOption = { appName: "testApp", funcName: "testFunc" };
    beforeEach(() => {
        redisClient = new MockRedisClient();
        baseCache = new base_1.BaseCache("testPrefix", cacheOption, redisClient);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should create a cache key", () => {
        expect(baseCache.createKey()).toBe("testPrefix-testApp-testFunc");
        expect(baseCache.createKey("value")).toBe("testPrefix-testApp-testFunc-value");
        expect(baseCache.createKey(123)).toBe("testPrefix-testApp-testFunc-123");
        expect(baseCache.createKey(true)).toBe("testPrefix-testApp-testFunc-true");
    });
    test("should convert data to string", () => {
        expect(baseCache["dataToString"]({ key: "value" })).toBe(JSON.stringify({ key: "value" }));
        expect(baseCache["dataToString"](true)).toBe("true");
        expect(baseCache["dataToString"](123)).toBe("123");
        expect(baseCache["dataToString"]("test")).toBe("test");
    });
    test("should create a pipeline", () => {
        const pipeline = {};
        redisClient.pipeline.mockReturnValue(pipeline);
        expect(baseCache.createPipeline()).toBe(pipeline);
    });
    test("should execute a transaction", async () => {
        const pipeline = {
            exec: jest.fn().mockResolvedValue("result"),
            set: jest.fn().mockReturnThis(),
        };
        redisClient.multi.mockReturnValue(pipeline);
        const commands = (pipeline) => {
            pipeline.set("key1", new Date().getTime());
            pipeline.set("key2", new Date().getTime());
            pipeline.set("key3", new Date().getTime());
        };
        const result = await baseCache.executeTransaction(commands);
        expect(redisClient.multi).toHaveBeenCalled();
        expect(pipeline.set).toHaveBeenCalledTimes(3);
        expect(pipeline.exec).toHaveBeenCalled();
        expect(result).toBe("result");
    });
});
