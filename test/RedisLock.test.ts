import { Redis } from "ioredis";
import RedisLock from "../src/Lock/RedisLock";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      eval: jest.fn(),
    })),
  };
});

const MockRedisClient = Redis as jest.MockedClass<typeof Redis>;

describe("RedisLock", () => {
  let redisClient: jest.Mocked<Redis>;
  let redisLock: RedisLock;

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<Redis>;
    redisLock = new RedisLock(redisClient, "testLock");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should acquire lock successfully", async () => {
    redisClient.set.mockResolvedValue("OK");

    const result = await redisLock.acquire();
    expect(redisClient.set).toHaveBeenCalledWith(
      "testLock",
      expect.any(String),
      "PX",
      30000,
      "NX"
    );
    expect(result).toBe(true);
  });

  test("should fail to acquire lock after max retries", async () => {
    redisClient.set.mockResolvedValue(null);
  
    const result = await redisLock.acquire(50, 3);
    expect(redisClient.set).toHaveBeenCalledTimes(3); // initial try + 2 retries
    expect(result).toBe(false);
  });  

  test("should release lock successfully", async () => {
    redisClient.eval.mockResolvedValue(1);

    const result = await redisLock.release();
    expect(redisClient.eval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      "testLock",
      expect.any(String)
    );
    expect(result).toBe(true);
  });

  test("should fail to release lock if not owner", async () => {
    redisClient.eval.mockResolvedValue(0);

    const result = await redisLock.release();
    expect(redisClient.eval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      "testLock",
      expect.any(String)
    );
    expect(result).toBe(false);
  });
});
