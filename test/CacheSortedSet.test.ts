import { CacheSortedSet } from "../src/TSRedisCacheKit/SortedSet";
import { Redis as RedisClient } from "ioredis";
import { CacheOption, ZMember } from "../src/type";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      zadd: jest.fn().mockResolvedValue(1),
      zrem: jest.fn().mockResolvedValue(1),
      zcount: jest.fn().mockResolvedValue(2),
      zrangebyscore: jest.fn().mockResolvedValue(["value1", "value2"]),
      zcard: jest.fn().mockResolvedValue(2),
      zrange: jest.fn().mockImplementation((key, start, stop, withScores) => {
        if (withScores === "WITHSCORES") {
          return Promise.resolve(["value1", "1.0", "value2", "2.0"]);
        }
        return Promise.resolve(["value1", "value2"]);
      }),
      zscore: jest.fn().mockResolvedValue("1.0"),
      zincrby: jest.fn().mockResolvedValue("2.0"),
      zremrangebyscore: jest.fn().mockResolvedValue(1),
      zremrangebyrank: jest.fn().mockResolvedValue(1),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("CacheSortedSet", () => {
  let cacheSortedSet: CacheSortedSet;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    cacheSortedSet = new CacheSortedSet("testPrefix", cacheOption, redisClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add a member to sorted set", async () => {
    const result = await cacheSortedSet.add(1, "value");
    expect(redisClient.zadd).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      1,
      "value"
    );
    expect(result).toBe(true);
  });

  test("should add multiple members to sorted set", async () => {
    const members: ZMember[] = [
      { score: 1, value: "value1" },
      { score: 2, value: "value2" },
    ];
    const result = await cacheSortedSet.adds(members);
    expect(redisClient.zadd).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      1,
      "value1",
      2,
      "value2"
    );
    expect(result).toBe(true);
  });

  test("should remove a member from sorted set", async () => {
    const result = await cacheSortedSet.remove("value");
    expect(redisClient.zrem).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      "value"
    );
    expect(result).toBe(true);
  });

  test("should count members in score range", async () => {
    const result = await cacheSortedSet.count(1, 2);
    expect(redisClient.zcount).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      1,
      2
    );
    expect(result).toBe(2);
  });

  test("should get members in score range", async () => {
    const result = await cacheSortedSet.rangeByScore(1, 2);
    expect(redisClient.zrangebyscore).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      1,
      2
    );
    expect(result).toEqual(["value1", "value2"]);
  });

  test("should get sorted set length", async () => {
    const result = await cacheSortedSet.length();
    expect(redisClient.zcard).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc"
    );
    expect(result).toBe(2);
  });

  test("should get members in range", async () => {
    const result = await cacheSortedSet.range(0, 1);
    expect(redisClient.zrange).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      0,
      1
    );
    expect(result).toEqual(["value1", "value2"]);
  });

  test("should get members with scores in range", async () => {
    const result = await cacheSortedSet.rangeWithScores(0, 1);
    expect(redisClient.zrange).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      0,
      1,
      "WITHSCORES"
    );
    expect(result).toEqual([
      { value: "value1", score: 1.0 },
      { value: "value2", score: 2.0 },
    ]);
  });

  test("should get score of a member", async () => {
    const result = await cacheSortedSet.score("value");
    expect(redisClient.zscore).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      "value"
    );
    expect(result).toBe(1.0);
  });

  test("should increment score of a member", async () => {
    const result = await cacheSortedSet.incrementBy("value", 1);
    expect(redisClient.zincrby).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      1,
      "value"
    );
    expect(result).toBe("2.0");
  });

  test("should remove members in score range", async () => {
    const result = await cacheSortedSet.removeRangeByScore(1, 2);
    expect(redisClient.zremrangebyscore).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      1,
      2
    );
    expect(result).toBe(1);
  });

  test("should remove members in rank range", async () => {
    const result = await cacheSortedSet.removeRangeByRank(0, 1);
    expect(redisClient.zremrangebyrank).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc",
      0,
      1
    );
    expect(result).toBe(1);
  });
});
