import { CacheSet } from "../src/TSRedisCacheKit/Set";
import { Redis as RedisClient } from "ioredis";
import { CacheOption } from "../src/type";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      sadd: jest.fn().mockResolvedValue(1),
      srem: jest.fn().mockResolvedValue(1),
      smembers: jest.fn().mockResolvedValue(["value1", "value2"]),
      sismember: jest.fn().mockResolvedValue(1),
      scard: jest.fn().mockResolvedValue(2),
      spop: jest.fn().mockResolvedValue("value1"),
      srandmember: jest.fn().mockResolvedValue("value1"),
      sunion: jest.fn().mockResolvedValue(["value1", "value2"]),
      sinter: jest.fn().mockResolvedValue(["value1"]),
      sdiff: jest.fn().mockResolvedValue(["value2"]),
      zadd: jest.fn().mockResolvedValue(1), // Mock zadd
      zrange: jest.fn().mockResolvedValue([]), // Mock zrange
      del: jest.fn().mockResolvedValue(1), // Mock del
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("CacheSet", () => {
  let cacheSet: CacheSet;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    cacheSet = new CacheSet("testPrefix", cacheOption, redisClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add a member to set", async () => {
    const result = await cacheSet.add("value");
    expect(redisClient.sadd).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      "value"
    );
    expect(result).toBe(true);
  });

  test("should add multiple members to set", async () => {
    const result = await cacheSet.addBatch(["value1", "value2"]);
    expect(redisClient.sadd).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      "value1",
      "value2"
    );
    expect(result).toBe(true);
  });

  test("should remove a member from set", async () => {
    const result = await cacheSet.remove("value");
    expect(redisClient.srem).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      "value"
    );
    expect(result).toBe(true);
  });

  test("should remove multiple members from set", async () => {
    const result = await cacheSet.removeBatch(["value1", "value2"]);
    expect(redisClient.srem).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      "value1",
      "value2"
    );
    expect(result).toBe(true);
  });

  test("should get all members of set", async () => {
    const result = await cacheSet.members();
    expect(redisClient.smembers).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc"
    );
    expect(result).toEqual(["value1", "value2"]);
  });

  test("should check if a member exists in set", async () => {
    const result = await cacheSet.exists("value");
    expect(redisClient.sismember).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      "value"
    );
    expect(result).toBe(1);
  });

  test("should get the size of set", async () => {
    const result = await cacheSet.size();
    expect(redisClient.scard).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc"
    );
    expect(result).toBe(2);
  });

  test("should pop a random member from set", async () => {
    const result = await cacheSet.pop();
    expect(redisClient.spop).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc"
    );
    expect(result).toBe("value1");
  });

  test("should pop multiple random members from set", async () => {
    redisClient.spop.mockResolvedValueOnce(["value1", "value2"]);
    const result = await cacheSet.popMultiple(2);
    expect(redisClient.spop).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      2
    );
    expect(result).toEqual(["value1", "value2"]);
  });

  test("should get a random member from set", async () => {
    const result = await cacheSet.randomMember();
    expect(redisClient.srandmember).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc"
    );
    expect(result).toBe("value1");
  });

  test("should get multiple random members from set", async () => {
    redisClient.srandmember.mockResolvedValueOnce(["value1", "value2"]);
    const result = await cacheSet.randomMembers(2);
    expect(redisClient.srandmember).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      2
    );
    expect(result).toEqual(["value1", "value2"]);
  });

  test("should get union of multiple sets", async () => {
    const result = await cacheSet.union("suffix1", "suffix2");
    expect(redisClient.sunion).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-suffix1",
      "testPrefix-testApp-testFunc-suffix2"
    );
    expect(result).toEqual(["value1", "value2"]);
  });

  test("should get intersection of multiple sets", async () => {
    const result = await cacheSet.intersect("suffix1", "suffix2");
    expect(redisClient.sinter).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-suffix1",
      "testPrefix-testApp-testFunc-suffix2"
    );
    expect(result).toEqual(["value1"]);
  });

  test("should get difference of multiple sets", async () => {
    const result = await cacheSet.difference("suffix1", "suffix2");
    expect(redisClient.sdiff).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-suffix1",
      "testPrefix-testApp-testFunc-suffix2"
    );
    expect(result).toEqual(["value2"]);
  });
});
