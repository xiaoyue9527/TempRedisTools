import { SlidingWindowRateLimiter } from "../src/Limiter/SlidingWindowRateLimiter";
import { Redis as RedisClient } from "ioredis";
import { RedisConfig } from "../src/type";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      zadd: jest.fn(),
      zremrangebyscore: jest.fn(),
      zcount: jest.fn(),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("SlidingWindowRateLimiter", () => {
  let rateLimiter: SlidingWindowRateLimiter;
  let redisClient: jest.Mocked<RedisClient>;
  const redisConfig: RedisConfig = {
    prefix: "testPrefix",
    option: { appName: "testApp", funcName: "testFunc" },
    redisClient: new MockRedisClient(),
  };

  beforeEach(() => {
    redisClient = redisConfig.redisClient as jest.Mocked<RedisClient>;
    rateLimiter = new SlidingWindowRateLimiter(redisConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create an instance with default values", () => {
    expect(rateLimiter.windowSize).toBe(10);
    expect(rateLimiter.limit).toBe(10);
    expect(rateLimiter.initialTime).toBe(1690000000000);
    expect(rateLimiter.sortedSetLength).toBe(60);
  });

  test("should create an instance with custom values", () => {
    const customRateLimiter = new SlidingWindowRateLimiter(
      redisConfig,
      20,
      30,
      1600000000000,
      100
    );
    expect(customRateLimiter.windowSize).toBe(20);
    expect(customRateLimiter.limit).toBe(30);
    expect(customRateLimiter.initialTime).toBe(1600000000000);
    expect(customRateLimiter.sortedSetLength).toBe(100);
  });

  test("should handle sorted set length", async () => {
    const currentTime = Date.now();
    redisClient.zremrangebyscore.mockResolvedValue(1);

    await rateLimiter.handleSortedSetLength("testKey", currentTime);

    const minTime =
      currentTime -
      1000 * (rateLimiter.windowSize + rateLimiter.sortedSetLength) -
      rateLimiter.initialTime;

    expect(redisClient.zremrangebyscore).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testKey",
      0,
      minTime
    );
  });

  test("should not be rate limited if the count is within the limit", async () => {
    redisClient.zcount.mockResolvedValue(5);

    const result = await rateLimiter.isRateLimited("testKey");

    expect(result.status).toBe(false);
    expect(result.limit).toBe(10);
    expect(result.current).toBe(5);
  });

  test("should be rate limited if the count exceeds the limit", async () => {
    redisClient.zcount.mockResolvedValue(15);

    const result = await rateLimiter.isRateLimited("testKey");

    expect(result.status).toBe(true);
    expect(result.msg).toContain("Limit exceeded");
  });

  test("should use custom limit value", async () => {
    redisClient.zcount.mockResolvedValue(6);

    const result = await rateLimiter.isRateLimited("testKey", 5);

    expect(result.status).toBe(true);
    expect(result.msg).toContain("Limit exceeded");
  });
});
