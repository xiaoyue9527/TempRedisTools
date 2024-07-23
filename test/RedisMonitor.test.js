"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const RedisMonitor_1 = require("../src/RedisMonitor/RedisMonitor");
// Mock ioredis
jest.mock("ioredis", () => {
    return jest.fn().mockImplementation(() => ({
        info: jest.fn(),
    }));
});
const MockRedisClient = ioredis_1.default;
describe("RedisMonitor", () => {
    let redisClient;
    let redisMonitor;
    let callback;
    beforeEach(() => {
        redisClient = new MockRedisClient();
        redisMonitor = new RedisMonitor_1.RedisMonitor(redisClient);
        callback = jest.fn();
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });
    test("should start monitoring and call callback with info", async () => {
        const info = "redis info";
        redisClient.info.mockResolvedValue(info);
        const setIntervalSpy = jest.spyOn(global, 'setInterval');
        redisMonitor.startMonitoring(1000, callback);
        expect(setIntervalSpy).toHaveBeenCalledTimes(1);
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Wait for the async function to resolve
        expect(redisClient.info).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(info);
        setIntervalSpy.mockRestore();
    });
    test("should warn if monitoring is already running", () => {
        console.warn = jest.fn();
        redisMonitor.startMonitoring(1000, callback);
        redisMonitor.startMonitoring(1000, callback);
        expect(console.warn).toHaveBeenCalledWith("Monitoring is already running.");
    });
    test("should stop monitoring", () => {
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
        redisMonitor.startMonitoring(1000, callback);
        redisMonitor.stopMonitoring();
        expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
        expect(redisMonitor["intervalId"]).toBeNull();
        clearIntervalSpy.mockRestore();
    });
    test("should warn if stopping monitoring that is not running", () => {
        console.warn = jest.fn();
        redisMonitor.stopMonitoring();
        expect(console.warn).toHaveBeenCalledWith("Monitoring is not running.");
    });
    test("should handle error when fetching Redis info", async () => {
        const error = new Error("fetching error");
        redisClient.info.mockRejectedValue(error);
        console.error = jest.fn();
        redisMonitor.startMonitoring(1000, callback);
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Wait for the async function to resolve
        expect(redisClient.info).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith("Error fetching Redis info:", error);
    });
});
