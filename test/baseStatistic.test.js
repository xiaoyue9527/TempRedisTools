"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const base_1 = require("../src/Statistic/base");
const ioredis_1 = require("ioredis");
// Mock ioredis
jest.mock("ioredis", () => {
    return {
        Redis: jest.fn().mockImplementation(() => ({
            set: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue("value"),
            exec: jest.fn().mockResolvedValue(["OK"]),
        })),
    };
});
jest.mock("../src/tools/time", () => {
    return {
        getTodayString: jest.fn(() => "2024-07-23"),
        getCurrentHourString: jest.fn(() => "2024-07-23-21"),
        getCurrentMonthString: jest.fn(() => "2024-07"),
        getCurrentYearString: jest.fn(() => "2024"),
    };
});
const MockRedisClient = ioredis_1.Redis;
class TestStatistic extends base_1.BaseStatistic {
    async add(value) {
        // Mock implementation
    }
    async getCount() {
        return 0; // Mock implementation
    }
}
describe("BaseStatistic", () => {
    let baseStatistic;
    let redisClient;
    const cacheOption = { appName: "testApp", funcName: "testFunc" };
    beforeEach(() => {
        redisClient = new MockRedisClient();
        baseStatistic = new TestStatistic("testPrefix", cacheOption, redisClient);
        // Mock Date to return a consistent value
        jest.useFakeTimers().setSystemTime(new Date("2024-07-23T21:44:00Z"));
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });
    test("should create a Redis key with default time unit (day)", () => {
        const key = baseStatistic.createKey("suffix");
        expect(key).toBe("testPrefix-testApp-testFunc-2024-07-23-suffix");
    });
    test("should create a Redis key with hour time unit", () => {
        baseStatistic.setTimeUnit("hour");
        const key = baseStatistic.createKey("suffix");
        expect(key).toBe("testPrefix-testApp-testFunc-2024-07-23-21-suffix");
    });
    test("should create a Redis key with month time unit", () => {
        baseStatistic.setTimeUnit("month");
        const key = baseStatistic.createKey("suffix");
        expect(key).toBe("testPrefix-testApp-testFunc-2024-07-suffix");
    });
    test("should create a Redis key with year time unit", () => {
        baseStatistic.setTimeUnit("year");
        const key = baseStatistic.createKey("suffix");
        expect(key).toBe("testPrefix-testApp-testFunc-2024-suffix");
    });
});
