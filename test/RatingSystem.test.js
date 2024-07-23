"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const RatingSystem_1 = require("../src/Ranking/RatingSystem");
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
            incrementBy: jest.fn(),
            score: jest.fn(),
            createKey: jest.fn().mockReturnValue("ratingKey"),
        })),
    };
});
const MockRedisClient = ioredis_1.Redis;
const MockCacheSortedSet = SortedSet_1.CacheSortedSet;
describe("RatingSystem", () => {
    let ratingSystem;
    let redisClient;
    let cacheSortedSet;
    beforeEach(() => {
        redisClient = new MockRedisClient();
        cacheSortedSet = new MockCacheSortedSet("ratingKey", { appName: "app", funcName: "rating" }, redisClient);
        ratingSystem = new RatingSystem_1.RatingSystem(redisClient, "ratingKey");
        ratingSystem.rating = cacheSortedSet; // Ensure the mocked instance is used
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
