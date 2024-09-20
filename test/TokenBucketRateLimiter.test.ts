import { TokenBucketRateLimiter } from "../src/Limiter/TokenBucketRateLimiter";
import { Redis as RedisClient } from "ioredis";
import { RedisConfig } from "../src/type";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      zadd: jest.fn().mockResolvedValue(1), // 添加 zadd 方法的模拟
      zrange: jest.fn().mockResolvedValue(["key1", "key2"]), // 添加 zrange 方法的模拟
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("TokenBucketRateLimiter", () => {
  let rateLimiter: TokenBucketRateLimiter;
  let redisClient: jest.Mocked<RedisClient>;
  const redisConfig: RedisConfig = {
    prefix: "testPrefix",
    option: { appName: "testApp", funcName: "testFunc" },
    redisClient: new MockRedisClient(),
  };

  beforeEach(() => {
    redisClient = redisConfig.redisClient as jest.Mocked<RedisClient>;
    rateLimiter = new TokenBucketRateLimiter(redisConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create an instance with default values", () => {
    expect(rateLimiter.maxTokens).toBe(100);
    expect(rateLimiter.refillRate).toBe(10);
  });

  test("should create an instance with custom values", () => {
    const customRateLimiter = new TokenBucketRateLimiter(
      redisConfig,
      200,
      20
    );
    expect(customRateLimiter.maxTokens).toBe(200);
    expect(customRateLimiter.refillRate).toBe(20);
  });

  test("should get tokens from Redis", async () => {
    redisClient.get.mockResolvedValue("50");

    const tokens = await rateLimiter.getTokens("testKey");

    expect(redisClient.get).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey");
    expect(tokens).toBe(50);
  });

  test("should return maxTokens if no tokens are found in Redis", async () => {
    redisClient.get.mockResolvedValue(null);

    const tokens = await rateLimiter.getTokens("testKey");

    expect(redisClient.get).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey");
    expect(tokens).toBe(100);
  });

  test("should set tokens in Redis", async () => {
    await rateLimiter.setTokens("testKey", 80);

    expect(redisClient.set).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", "80");
  });

  test("should refill tokens", async () => {
    const lastRefillTime = Date.now() - 5000; // 5 seconds ago
    await rateLimiter.refillTokens("testKey", lastRefillTime);

    const timeElapsed = 5; // seconds
    const newTokens = Math.min(rateLimiter.maxTokens, Math.floor(timeElapsed * rateLimiter.refillRate));

    expect(redisClient.set).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", newTokens.toString());
  });

  test("should not be rate limited if there are tokens available", async () => {
    redisClient.get.mockResolvedValue("10");

    const result = await rateLimiter.isRateLimited("testKey");

    expect(result.status).toBe(false);
    expect(redisClient.set).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", "9");
  });

  test("should be rate limited if there are no tokens available", async () => {
    redisClient.get.mockResolvedValue("0");

    const result = await rateLimiter.isRateLimited("testKey");

    expect(result.status).toBe(true);
  });
});
