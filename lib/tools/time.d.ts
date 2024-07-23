/**
 * 时间操作工具对象
 */
declare const time: {
    /**
     * 在当前时间基础上添加指定时间
     * @param amount - 要添加的时间数量
     * @param unit - 要添加的时间单位，支持 'second'、'minute'、'hour'、'day'，默认为 'day'
     * @returns 新的 Date 对象，表示添加指定时间后的时间点
     */
    add: (amount: number, unit?: "second" | "minute" | "hour" | "day") => Date;
};
declare function convertUnitToSeconds(unit: string): number;
/**
 * 获取今天的日期字符串，格式为 YYYY-MM-DD 或其他指定分隔符。
 * @param date 可选参数，要获取日期的 Date 对象，默认为当前日期。
 * @param connector 可选参数，日期中的分隔符，默认为横杠 ("-")。
 * @returns 返回今天的日期字符串，例如 "2023-10-23" 或其他指定格式。
 */
export declare function getTodayString(date?: Date, connector?: string): string;
/**
 * 获取当前小时的字符串，格式为 YYYY-MM-DD-HH。
 * @param date 可选参数，要获取小时的 Date 对象，默认为当前日期。
 * @returns 返回当前小时的字符串，例如 "2023-10-23-14"。
 */
export declare function getCurrentHourString(date?: Date): string;
/**
 * 获取当前月份的字符串，格式为 YYYY-MM。
 * @param date 可选参数，要获取月份的 Date 对象，默认为当前日期。
 * @returns 返回当前月份的字符串，例如 "2023-10"。
 */
export declare function getCurrentMonthString(date?: Date): string;
/**
 * 获取当前年份的字符串，格式为 YYYY。
 * @param date 可选参数，要获取年份的 Date 对象，默认为当前日期。
 * @returns 返回当前年份的字符串，例如 "2023"。
 */
export declare function getCurrentYearString(date?: Date): string;
export { time, convertUnitToSeconds };
