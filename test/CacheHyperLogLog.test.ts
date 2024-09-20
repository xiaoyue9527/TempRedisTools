import { Redis as RedisClient } from "ioredis";
import { CacheOption } from "../src/type";
import { CacheHyperLogLog } from "../src/TSRedisCacheKit/HyperLogLog";

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
      zadd: jest.fn().mockResolvedValue(1),
      zrange: jest.fn().mockResolvedValue(["key1", "key2"]),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("CacheHyperLogLog", () => {
  let cacheHyperLogLog: CacheHyperLogLog;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    cacheHyperLogLog = new CacheHyperLogLog(
      "testPrefix",
      cacheOption,
      redisClient
    );
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

    expect(redisClient.pfmerge).toHaveBeenCalledWith(
      key,
      "testPrefix-key1",
      "testPrefix-key2"
    );
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

  test("should clear all cache", async () => {
    // Mock zrange to return some keys
    redisClient.zrange.mockResolvedValue(["key1", "key2"]);

    await cacheHyperLogLog.clearAllCache();

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

    await cacheHyperLogLog.clearAllCache();

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
