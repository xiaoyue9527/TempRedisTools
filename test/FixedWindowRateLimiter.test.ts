import { FixedWindowRateLimiter } from "../src/Limiter/FixedWindowRateLimiter";
import { Redis as RedisClient } from "ioredis";
import { RedisConfig } from "../src/type";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      incr: jest.fn(),
      expire: jest.fn(),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("FixedWindowRateLimiter", () => {
  let rateLimiter: FixedWindowRateLimiter;
  let redisClient: jest.Mocked<RedisClient>;
  const redisConfig: RedisConfig = {
    prefix: "testPrefix",
    option: { appName: "testApp", funcName: "testFunc" },
    redisClient: new MockRedisClient(),
  };

  beforeEach(() => {
    redisClient = redisConfig.redisClient as jest.Mocked<RedisClient>;
    rateLimiter = new FixedWindowRateLimiter(redisConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create an instance with default values", () => {
    expect(rateLimiter.windowSize).toBe(10);
    expect(rateLimiter.limit).toBe(10);
  });

  test("should create an instance with custom values", () => {
    const customRateLimiter = new FixedWindowRateLimiter(redisConfig, 20, 30);
    expect(customRateLimiter.windowSize).toBe(20);
    expect(customRateLimiter.limit).toBe(30);
  });

  test("should not be rate limited if the count is within the limit", async () => {
    redisClient.incr.mockResolvedValue(1);
    redisClient.expire.mockResolvedValue(1);

    const result = await rateLimiter.isRateLimited("testKey");

    expect(redisClient.incr).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey");
    expect(redisClient.expire).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", 10);
    expect(result.status).toBe(false);
  });

  test("should be rate limited if the count exceeds the limit", async () => {
    redisClient.incr.mockResolvedValue(11);

    const result = await rateLimiter.isRateLimited("testKey");

    expect(redisClient.incr).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey");
    expect(result.status).toBe(true);
  });

  test("should use custom limit value", async () => {
    redisClient.incr.mockResolvedValue(6);

    const result = await rateLimiter.isRateLimited("testKey", 5);

    expect(redisClient.incr).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey");
    expect(result.status).toBe(true);
  });

  test("should set expiration only on first increment", async () => {
    redisClient.incr.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    redisClient.expire.mockResolvedValue(1);

    const result1 = await rateLimiter.isRateLimited("testKey");
    const result2 = await rateLimiter.isRateLimited("testKey");

    expect(redisClient.incr).toHaveBeenCalledTimes(2);
    expect(redisClient.expire).toHaveBeenCalledTimes(1);
    expect(result1.status).toBe(false);
    expect(result2.status).toBe(false);
  });
});
