import { Redis as RedisClient } from "ioredis";
import { RatingSystem } from "../src/Ranking/RatingSystem";
import { CacheSortedSet } from "../src/TSRedisCacheKit/SortedSet";

// Mock ioredis and CacheSortedSet
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      zrevrank: jest.fn(),
    })),
  };
});

jest.mock("../src/TSRedisCacheKit/SortedSet", () => {
  return {
    CacheSortedSet: jest.fn().mockImplementation(() => ({
      incrementBy: jest.fn(),
      score: jest.fn(),
      createKey: jest.fn().mockReturnValue("ratingKey"),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;
const MockCacheSortedSet = CacheSortedSet as jest.MockedClass<
  typeof CacheSortedSet
>;

describe("RatingSystem", () => {
  let ratingSystem: RatingSystem;
  let redisClient: jest.Mocked<RedisClient>;
  let cacheSortedSet: jest.Mocked<CacheSortedSet>;

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    cacheSortedSet = new MockCacheSortedSet(
      "ratingKey",
      { appName: "app", funcName: "rating" },
      redisClient
    ) as jest.Mocked<CacheSortedSet>;
    ratingSystem = new RatingSystem(redisClient, "ratingKey");
    (ratingSystem as any).rating = cacheSortedSet; // Ensure the mocked instance is used
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add a rating", async () => {
    await ratingSystem.addRating("item1", 5);
    expect(cacheSortedSet.incrementBy).toHaveBeenCalledWith("item1", 5);
  });

  test("should get a rating", async () => {
    cacheSortedSet.score.mockResolvedValue(10);
    const rating = await ratingSystem.getRating("item1");
    expect(cacheSortedSet.score).toHaveBeenCalledWith("item1");
    expect(rating).toBe(10);
  });

  test("should get rating rank", async () => {
    redisClient.zrevrank.mockResolvedValue(1);
    const rank = await ratingSystem.getRatingRank("item1");
    expect(redisClient.zrevrank).toHaveBeenCalledWith("ratingKey", "item1");
    expect(rank).toBe(1);
  });

  test("should update rating", async () => {
    await ratingSystem.updateRating("item1", 3);
    expect(cacheSortedSet.incrementBy).toHaveBeenCalledWith("item1", 3);
  });
});
