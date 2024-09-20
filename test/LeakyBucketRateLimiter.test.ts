import { LeakyBucketRateLimiter } from "../src/Limiter/LeakyBucketRateLimiter";
import { Redis as RedisClient } from "ioredis";
import { RedisConfig } from "../src/type";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      hgetall: jest.fn(),
      hmset: jest.fn(),
      zadd: jest.fn().mockResolvedValue(1), // 添加 zadd 方法的模拟
      zrange: jest.fn().mockResolvedValue(["key1", "key2"]), // 添加 zrange 方法的模拟
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("LeakyBucketRateLimiter", () => {
  let rateLimiter: LeakyBucketRateLimiter;
  let redisClient: jest.Mocked<RedisClient>;
  const redisConfig: RedisConfig = {
    prefix: "testPrefix",
    option: { appName: "testApp", funcName: "testFunc" },
    redisClient: new MockRedisClient(),
  };

  beforeEach(() => {
    redisClient = redisConfig.redisClient as jest.Mocked<RedisClient>;
    rateLimiter = new LeakyBucketRateLimiter(redisConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create an instance with default values", () => {
    expect(rateLimiter.capacity).toBe(100);
    expect(rateLimiter.leakRate).toBe(10);
  });

  test("should create an instance with custom values", () => {
    const customRateLimiter = new LeakyBucketRateLimiter(
      redisConfig,
      200,
      20
    );
    expect(customRateLimiter.capacity).toBe(200);
    expect(customRateLimiter.leakRate).toBe(20);
  });

  test("should get bucket state from Redis", async () => {
    redisClient.hgetall.mockResolvedValue({ tokens: "50", lastLeakTime: "1600000000000" });

    const state = await rateLimiter.getBucketState("testKey");

    expect(redisClient.hgetall).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey");
    expect(state.tokens).toBe(50);
    expect(state.lastLeakTime).toBe(1600000000000);
  });

  test("should return default bucket state if no state found in Redis", async () => {
    redisClient.hgetall.mockResolvedValue({});

    const state = await rateLimiter.getBucketState("testKey");

    expect(redisClient.hgetall).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey");
    expect(state.tokens).toBe(0);
    expect(state.lastLeakTime).toBeGreaterThan(1600000000000); // Current time
  });

  test("should set bucket state in Redis", async () => {
    await rateLimiter.setBucketState("testKey", 80, 1600000000000);

    expect(redisClient.hmset).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", { tokens: "80", lastLeakTime: "1600000000000" });
  });

  test("should leak tokens", async () => {
    const currentTime = Date.now();
    redisClient.hgetall.mockResolvedValue({ tokens: "50", lastLeakTime: (currentTime - 5000).toString() }); // 5 seconds ago

    await rateLimiter.leakTokens("testKey");

    const timeElapsed = 5; // seconds
    const leakedTokens = Math.floor(timeElapsed * rateLimiter.leakRate);
    const newTokens = Math.max(0, 50 - leakedTokens);

    expect(redisClient.hmset).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", { tokens: newTokens.toString(), lastLeakTime: currentTime.toString() });
  });

  test("should not be rate limited if there is capacity", async () => {
    redisClient.hgetall.mockResolvedValue({ tokens: "50", lastLeakTime: Date.now().toString() });

    const result = await rateLimiter.isRateLimited("testKey");

    expect(result.status).toBe(false);
    expect(redisClient.hmset).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", expect.objectContaining({ tokens: "51" }));
  });

  test("should be rate limited if there is no capacity", async () => {
    redisClient.hgetall.mockResolvedValue({ tokens: "100", lastLeakTime: Date.now().toString() });

    const result = await rateLimiter.isRateLimited("testKey");

    expect(result.status).toBe(true);
  });
});
