"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = require("../src/tools/time");
describe("time", () => {
    describe("add", () => {
        const now = Date.now();
        jest.spyOn(global.Date, "now").mockImplementation(() => now);
        it("should add seconds correctly", () => {
            const result = time_1.time.add(10, "second");
            expect(result.getTime()).toBe(now + 10 * 1000);
        });
        it("should add minutes correctly", () => {
            const result = time_1.time.add(5, "minute");
            expect(result.getTime()).toBe(now + 5 * 60 * 1000);
        });
        it("should add hours correctly", () => {
            const result = time_1.time.add(2, "hour");
            expect(result.getTime()).toBe(now + 2 * 60 * 60 * 1000);
        });
        it("should add days correctly", () => {
            const result = time_1.time.add(1, "day");
            expect(result.getTime()).toBe(now + 24 * 60 * 60 * 1000);
        });
        it("should default to adding days", () => {
            const result = time_1.time.add(3);
            expect(result.getTime()).toBe(now + 3 * 24 * 60 * 60 * 1000);
        });
    });
});
describe("convertUnitToSeconds", () => {
    it("should convert days to seconds", () => {
        expect((0, time_1.convertUnitToSeconds)("2D")).toBe(2 * 24 * 60 * 60);
    });
    it("should convert hours to seconds", () => {
        expect((0, time_1.convertUnitToSeconds)("3H")).toBe(3 * 60 * 60);
    });
    it("should convert minutes to seconds", () => {
        expect((0, time_1.convertUnitToSeconds)("15M")).toBe(15 * 60);
    });
    it("should return the input if it is in seconds", () => {
        expect((0, time_1.convertUnitToSeconds)("45")).toBe(45);
    });
    it("should handle invalid input gracefully", () => {
        expect((0, time_1.convertUnitToSeconds)("invalid")).toBeNaN();
    });
});
describe("getTodayString", () => {
    it("should return today's date in default format", () => {
        const date = new Date(2023, 9, 23); // October 23, 2023
        expect((0, time_1.getTodayString)(date)).toBe("2023-10-23");
    });
    it("should return today's date with custom connector", () => {
        const date = new Date(2023, 9, 23); // October 23, 2023
        expect((0, time_1.getTodayString)(date, "/")).toBe("2023/10/23");
    });
});
describe("getCurrentHourString", () => {
    it("should return current hour in default format", () => {
        const date = new Date(2023, 9, 23, 14); // October 23, 2023, 14:00
        expect((0, time_1.getCurrentHourString)(date)).toBe("2023-10-23-14");
    });
});
describe("getCurrentMonthString", () => {
    it("should return current month in default format", () => {
        const date = new Date(2023, 9, 23); // October 23, 2023
        expect((0, time_1.getCurrentMonthString)(date)).toBe("2023-10");
    });
});
describe("getCurrentYearString", () => {
    it("should return current year in default format", () => {
        const date = new Date(2023, 9, 23); // October 23, 2023
        expect((0, time_1.getCurrentYearString)(date)).toBe("2023");
    });
});
