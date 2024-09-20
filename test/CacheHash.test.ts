import { Redis as RedisClient } from "ioredis";
import { BitCountRange, CacheOption } from "../src/type";
import { CacheBitField } from "../src/TSRedisCacheKit/BitField";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      setbit: jest.fn(),
      getbit: jest.fn(),
      bitcount: jest.fn(),
      bitop: jest.fn(),
      zadd: jest.fn().mockResolvedValue(1),
      zrange: jest.fn().mockResolvedValue(["key1", "key2"]),
      del: jest.fn().mockResolvedValue(2),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("CacheBitField", () => {
  let cacheBitField: CacheBitField;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    cacheBitField = new CacheBitField("testPrefix", cacheOption, redisClient);
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
    const option: BitCountRange = { start: 0, end: 10, mode: "BYTE" };
    const result = await cacheBitField.count(option, "suffix");
    const key = cacheBitField.createKey("suffix");

    expect(redisClient.bitcount).toHaveBeenCalledWith(key, 0, 10, "BYTE");
    expect(result).toBe(5);
  });

  test("should count bits in range with BIT mode", async () => {
    redisClient.bitcount.mockResolvedValue(3);
    const option: BitCountRange = { start: 0, end: 10, mode: "BIT" };
    const result = await cacheBitField.count(option, "suffix");
    const key = cacheBitField.createKey("suffix");

    expect(redisClient.bitcount).toHaveBeenCalledWith(key, 0, 10, "BIT");
    expect(result).toBe(3);
  });

  test("should count bits in range without mode", async () => {
    redisClient.bitcount.mockResolvedValue(7);
    const option: BitCountRange = { start: 0, end: 10 };
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

    expect(redisClient.bitop).toHaveBeenCalledWith(
      "AND",
      "destKey",
      key1,
      key2
    );
    expect(result).toBe(10);
  });

  test("should clear all cache", async () => {
    // Mock zrange to return some keys
    redisClient.zrange.mockResolvedValue(["key1", "key2"]);

    await cacheBitField.clearAllCache();

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

    await cacheBitField.clearAllCache();

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
