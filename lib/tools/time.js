"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.time = void 0;
exports.getTodayString = getTodayString;
exports.getCurrentHourString = getCurrentHourString;
exports.getCurrentMonthString = getCurrentMonthString;
exports.getCurrentYearString = getCurrentYearString;
exports.convertUnitToSeconds = convertUnitToSeconds;
/**
 * 时间操作工具对象
 */
const time = {
    /**
     * 在当前时间基础上添加指定时间
     * @param amount - 要添加的时间数量
     * @param unit - 要添加的时间单位，支持 'second'、'minute'、'hour'、'day'，默认为 'day'
     * @returns 新的 Date 对象，表示添加指定时间后的时间点
     */
    add: (amount, unit = "day") => {
        switch (unit) {
            case "second":
                return new Date(Date.now() + amount * 1000);
            case "minute":
                return new Date(Date.now() + amount * 60 * 1000);
            case "hour":
                return new Date(Date.now() + amount * 60 * 60 * 1000);
            case "day":
                return new Date(Date.now() + amount * 60 * 60 * 24 * 1000);
        }
    },
};
exports.time = time;
function convertUnitToSeconds(unit) {
    const timeValue = parseInt(unit, 10); // 提取数字部分
    switch (unit.charAt(unit.length - 1)) {
        case "D":
            return timeValue * 24 * 60 * 60; // 将天转换为秒
        case "H":
            return timeValue * 60 * 60; // 将小时转换为秒
        case "M":
            return timeValue * 60; // 将分钟转换为秒
        default:
            return timeValue; // 默认为秒，直接返回
    }
}
/**
 * 获取今天的日期字符串，格式为 YYYY-MM-DD 或其他指定分隔符。
 * @param date 可选参数，要获取日期的 Date 对象，默认为当前日期。
 * @param connector 可选参数，日期中的分隔符，默认为横杠 ("-")。
 * @returns 返回今天的日期字符串，例如 "2023-10-23" 或其他指定格式。
 */
function getTodayString(date = new Date(), connector = "-") {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return [year, month, day].join(connector);
}
/**
 * 获取当前小时的字符串，格式为 YYYY-MM-DD-HH。
 * @param date 可选参数，要获取小时的 Date 对象，默认为当前日期。
 * @returns 返回当前小时的字符串，例如 "2023-10-23-14"。
 */
function getCurrentHourString(date = new Date()) {
    const todayString = getTodayString(date);
    const hour = date.getHours().toString().padStart(2, "0");
    return `${todayString}-${hour}`;
}
/**
 * 获取当前月份的字符串，格式为 YYYY-MM。
 * @param date 可选参数，要获取月份的 Date 对象，默认为当前日期。
 * @returns 返回当前月份的字符串，例如 "2023-10"。
 */
function getCurrentMonthString(date = new Date()) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
}
/**
 * 获取当前年份的字符串，格式为 YYYY。
 * @param date 可选参数，要获取年份的 Date 对象，默认为当前日期。
 * @returns 返回当前年份的字符串，例如 "2023"。
 */
function getCurrentYearString(date = new Date()) {
    return date.getFullYear().toString();
}
