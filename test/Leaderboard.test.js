"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Leaderboard_1 = require("../src/Ranking/Leaderboard");
const ioredis_1 = require("ioredis");
const SortedSet_1 = require("../src/TSRedisCacheKit/SortedSet");
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
            add: jest.fn(),
            remove: jest.fn(),
            score: jest.fn(),
            rangeWithScores: jest.fn(),
            incrementBy: jest.fn(),
            createKey: jest.fn().mockReturnValue("leaderboardKey"),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
const MockCacheSortedSet = SortedSet_1.CacheSortedSet;
describe("Leaderboard", () => {
    let leaderboard;
    let redisClient;
    let cacheSortedSet;
    beforeEach(() => {
        redisClient = new MockRedisClient();
        cacheSortedSet = new MockCacheSortedSet("leaderboardKey", { appName: "app", funcName: "leaderboard" }, redisClient);
        leaderboard = new Leaderboard_1.Leaderboard(redisClient, "leaderboardKey");
        leaderboard.leaderboard = cacheSortedSet; // Ensure the mocked instance is used
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should add a user with score", async () => {
        await leaderboard.addUser("user1", 100);
        expect(cacheSortedSet.add).toHaveBeenCalledWith(100, "user1");
    });
    test("should remove a user", async () => {
        await leaderboard.removeUser("user1");
        expect(cacheSortedSet.remove).toHaveBeenCalledWith("user1");
    });
    test("should get user rank and score", async () => {
        redisClient.zrevrank.mockResolvedValue(1);
        cacheSortedSet.score.mockResolvedValue(100);
        const result = await leaderboard.getUserRank("user1");
        expect(redisClient.zrevrank).toHaveBeenCalledWith("leaderboardKey", "user1");
        expect(cacheSortedSet.score).toHaveBeenCalledWith("user1");
        expect(result).toEqual({ rank: 1, score: 100 });
    });
    test("should get top N users", async () => {
        const topUsers = [
            { value: "user1", score: 100 },
            { value: "user2", score: 90 },
        ];
        cacheSortedSet.rangeWithScores.mockResolvedValue(topUsers);
        const result = await leaderboard.getTopUsers(2);
        expect(cacheSortedSet.rangeWithScores).toHaveBeenCalledWith(0, 1);
        expect(result).toEqual(topUsers);
    });
    test("should update user score", async () => {
        await leaderboard.updateScore("user1", 50);
        expect(cacheSortedSet.incrementBy).toHaveBeenCalledWith("user1", 50);
    });
});
