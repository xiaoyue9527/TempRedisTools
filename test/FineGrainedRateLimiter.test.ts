import { FineGrainedRateLimiter } from "../src/Limiter/FineGrainedRateLimiter";
import { Redis as RedisClient } from "ioredis";
import { LimitItemConfig, RedisConfig } from "../src/type";
import { convertUnitToSeconds } from "../src/tools/time";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      lpush: jest.fn().mockResolvedValue(1),
      rpush: jest.fn().mockResolvedValue(1),
      ltrim: jest.fn().mockResolvedValue("OK"),
      llen: jest.fn().mockResolvedValue(1),
      lrange: jest.fn().mockResolvedValue(["1620000000000"]),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("FineGrainedRateLimiter", () => {
  let rateLimiter: FineGrainedRateLimiter;
  let redisClient: jest.Mocked<RedisClient>;
  const redisConfig: RedisConfig = {
    prefix: "testPrefix",
    option: { appName: "testApp", funcName: "testFunc" },
    redisClient: new MockRedisClient(),
  };
  const limitOption: LimitItemConfig[] = [
    { limit: 5, unit: "minute", name: "minuteLimit" },
    { limit: 10, unit: "hour", name: "hourLimit" },
  ];

  beforeEach(() => {
    redisClient = redisConfig.redisClient as jest.Mocked<RedisClient>;
    rateLimiter = new FineGrainedRateLimiter(redisConfig, limitOption);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add a timestamp to the list", async () => {
    await rateLimiter.add("testKey");
    expect(redisClient.rpush).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", expect.any(String));
  });

  test("should handle list length correctly", async () => {
    redisClient.llen.mockResolvedValue(50); // 设置长度为 50，以确保超过 maxListLength
    await rateLimiter.handleListLength("testKey");
    expect(redisClient.ltrim).toHaveBeenCalledWith("testPrefix-testApp-testFunc-testKey", 20, -1);
  });

  test("should check if rate limit is exceeded", async () => {
    redisClient.llen.mockResolvedValue(6);
    redisClient.lrange.mockResolvedValue([
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 1000).toString(),
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 2000).toString(),
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 3000).toString(),
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 4000).toString(),
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 5000).toString(),
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 6000).toString(),
    ]);

    const result = await rateLimiter.isRateLimited("testKey");
    expect(result.status).toBe(false);
  });

  test("should not be rate limited if within limits", async () => {
    redisClient.llen.mockResolvedValue(3);
    redisClient.lrange.mockResolvedValue([
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 1000).toString(),
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 2000).toString(),
      (Date.now() - convertUnitToSeconds("minute") * 1000 + 3000).toString(),
    ]);

    const result = await rateLimiter.isRateLimited("testKey");
    expect(result.status).toBe(false);
  });
});
