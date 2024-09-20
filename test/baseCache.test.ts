import { BaseCache } from "../src/TSRedisCacheKit/base";
import { Redis as RedisClient, ChainableCommander } from "ioredis";
import { CacheOption } from "../src/type";

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
      zadd: jest.fn().mockResolvedValue(1),
      zrange: jest.fn().mockResolvedValue(["key1", "key2"]),
      del: jest.fn().mockResolvedValue(2),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("BaseCache", () => {
  let baseCache: BaseCache;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    baseCache = new BaseCache("testPrefix", cacheOption, redisClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create a cache key", () => {
    expect(baseCache.createKey()).toBe("testPrefix-testApp-testFunc");
    expect(baseCache.createKey("value")).toBe(
      "testPrefix-testApp-testFunc-value"
    );
    expect(baseCache.createKey(123)).toBe("testPrefix-testApp-testFunc-123");
    expect(baseCache.createKey(true)).toBe("testPrefix-testApp-testFunc-true");
  });

  test("should convert data to string", () => {
    expect(baseCache["dataToString"]({ key: "value" })).toBe(
      JSON.stringify({ key: "value" })
    );
    expect(baseCache["dataToString"](true)).toBe("true");
    expect(baseCache["dataToString"](123)).toBe("123");
    expect(baseCache["dataToString"]("test")).toBe("test");
  });

  test("should create a pipeline", () => {
    const pipeline = {};
    redisClient.pipeline.mockReturnValue(pipeline as any);
    expect(baseCache.createPipeline()).toBe(pipeline);
  });

  test("should execute a transaction", async () => {
    const pipeline = {
      exec: jest.fn().mockResolvedValue("result"),
      set: jest.fn().mockReturnThis(),
    };
    redisClient.multi.mockReturnValue(pipeline as any);

    const commands = (pipeline: ChainableCommander) => {
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

  test("should clear all cache", async () => {
    // Mock zrange to return some keys
    redisClient.zrange.mockResolvedValue(["key1", "key2"]);

    await baseCache.clearAllCache();

    expect(redisClient.zrange).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-keys",
      0,
      -1
    );
    expect(redisClient.del).toHaveBeenCalledWith("key1", "key2");
    expect(redisClient.del).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-keys"
    );
  });

  test("should handle clearAllCache with no keys", async () => {
    // Mock zrange to return no keys
    redisClient.zrange.mockResolvedValue([]);

    await baseCache.clearAllCache();

    expect(redisClient.zrange).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-keys",
      0,
      -1
    );
    // del should only be called once for the keySetKey
    expect(redisClient.del).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-keys"
    );
    expect(redisClient.del).toHaveBeenCalledTimes(1);
  });
});
