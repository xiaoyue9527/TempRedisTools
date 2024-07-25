import { CompositeLeaderboard } from "../src/Ranking/CompositeLeaderboard";
import { Leaderboard } from "../src/Ranking/Leaderboard";
import { RatingSystem } from "../src/Ranking/RatingSystem";
import { Redis as RedisClient } from "ioredis";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      zrevrank: jest.fn(),
    })),
  };
});

// Mock Leaderboard and RatingSystem
jest.mock("../src/Ranking/Leaderboard");
jest.mock("../src/Ranking/RatingSystem");

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;
const MockLeaderboard = Leaderboard as jest.MockedClass<typeof Leaderboard>;
const MockRatingSystem = RatingSystem as jest.MockedClass<typeof RatingSystem>;

describe("CompositeLeaderboard", () => {
  let redisClient: jest.Mocked<RedisClient>;
  let compositeLeaderboard: CompositeLeaderboard;

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    compositeLeaderboard = new CompositeLeaderboard(
      redisClient,
      "compositeKey"
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add score to leaderboard", async () => {
    const mockAddUser = jest.fn();
    MockLeaderboard.mockImplementation(() => {
      return {
        addUser: mockAddUser,
      } as any;
    });

    await compositeLeaderboard.addScore("user1", 100, "2023-07");

    expect(MockLeaderboard).toHaveBeenCalledWith(
      redisClient,
      "compositeKey:2023-07"
    );
    expect(mockAddUser).toHaveBeenCalledWith("user1", 100);
  });

  test("should add rating to rating system", async () => {
    const mockAddRating = jest.fn();
    MockRatingSystem.mockImplementation(() => {
      return {
        addRating: mockAddRating,
      } as any;
    });

    await compositeLeaderboard.addRating("item1", 5, "2023-07");

    expect(MockRatingSystem).toHaveBeenCalledWith(
      redisClient,
      "compositeKey:2023-07"
    );
    expect(mockAddRating).toHaveBeenCalledWith("item1", 5);
  });

  test("should get composite rank and score", async () => {
    const mockGetUserRank = jest
      .fn()
      .mockResolvedValue({ rank: 1, score: 200 });
    const mockGetRating = jest.fn().mockResolvedValue(50);
    MockLeaderboard.mockImplementation(() => {
      return {
        getUserRank: mockGetUserRank,
      } as any;
    });
    MockRatingSystem.mockImplementation(() => {
      return {
        getRating: mockGetRating,
      } as any;
    });

    const result = await compositeLeaderboard.getCompositeRank(
      "user1",
      "2023-07"
    );

    expect(MockLeaderboard).toHaveBeenCalledWith(
      redisClient,
      "compositeKey:2023-07"
    );
    expect(MockRatingSystem).toHaveBeenCalledWith(
      redisClient,
      "compositeKey:2023-07"
    );
    expect(mockGetUserRank).toHaveBeenCalledWith("user1");
    expect(mockGetRating).toHaveBeenCalledWith("user1");
    expect(result).toEqual({ rank: 1, score: 155 });
  });

  test("should get top composite users", async () => {
    const mockGetTopUsers = jest.fn().mockResolvedValue([
      { value: "user1", score: 200 },
      { value: "user2", score: 150 },
    ]);
    const mockGetRating = jest
      .fn()
      .mockResolvedValueOnce(50) // user1's rating
      .mockResolvedValueOnce(30); // user2's rating
    MockLeaderboard.mockImplementation(() => {
      return {
        getTopUsers: mockGetTopUsers,
      } as any;
    });
    MockRatingSystem.mockImplementation(() => {
      return {
        getRating: mockGetRating,
      } as any;
    });

    const result = await compositeLeaderboard.getTopCompositeUsers(
      2,
      "2023-07"
    );

    expect(MockLeaderboard).toHaveBeenCalledWith(
      redisClient,
      "compositeKey:2023-07"
    );
    expect(MockRatingSystem).toHaveBeenCalledWith(
      redisClient,
      "compositeKey:2023-07"
    );
    expect(mockGetTopUsers).toHaveBeenCalledWith(2);
    expect(mockGetRating).toHaveBeenCalledTimes(2);

    // user1: score = 200 * 0.7 + 50 * 0.3 = 140 + 15 = 155
    // user2: score = 150 * 0.7 + 30 * 0.3 = 105 + 9 = 114
    expect(result).toEqual([
      { member: "user1", score: 155 },
      { member: "user2", score: 114 },
    ]);
  });
});
