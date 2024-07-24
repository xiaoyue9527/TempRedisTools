/**
 * 缓存选项接口
 */
export interface CacheOption {
  appName: string; // 应用名称
  funcName: string; // 函数名称
}

export interface RedisConfig {
  prefix: string;
  option: CacheOption;
  redisClient: RedisClientType;
}

/**
 * 有序集合成员接口
 */
export interface ZMember {
  score: number; // 成员的分数
  value: RedisCommandArgument; // 成员的值
}

/**
 * 位计数范围接口
 */
export interface BitCountRange {
  start: number; // 起始位置
  end: number; // 结束位置
  mode?: "BYTE" | "BIT"; // 计数模式，可选 BYTE 或 BIT
}

/**
 * 位域操作接口
 * 用于定义 Redis 位图命令 BITFIELD 的操作，包括操作类型、数据类型、偏移量和可选的值。
 */
export interface BitFieldOperation {
  operation: string;
  type: string;
  offset: number;
  value?: number;
}
/**
 * Redis 命令参数类型
 */
export type RedisCommandArgument = string | Buffer;

export interface CacheOption {
  appName: string;
  funcName: string;
}

// 限流项的配置接口
export interface LimitItemConfig {
  name?: string;
  unit: string;
  limit: number;
  message?: string;
}
// 通过限流项配置的限制数目和计数的项接口
export interface LimiterPassItem extends LimitItemConfig {
  count: number;
}
// 通过时间单位到限制数目和计数的字典类型
export type LimiterPassDict = Record<number, LimiterPassItem>;
