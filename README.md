# TempRedisTools

## 项目简介

TempRedisTools 是一个基于 Redis 的工具库，提供了一系列实用的 Redis 功能模块，包括限流器、锁、排行榜、监控、抄袭检测、统计以及缓存等功能。该工具库主要使用 TypeScript 编写，并且提供了丰富的测试和部署配置。

## 目录结构

```
TempRedisTools
├── README.md                   项目的自述文件，介绍项目的基本信息和使用方法。
├── coverage                    存放代码覆盖率报告的目录。
├── data                        存放数据文件的目录。
│   └── testPrefix-testApp-testFunc-testChannel.log
├── deploy
│   ├── dev
│   │   └── docker-compose.yaml 开发环境的 Docker Compose 配置文件。
│   └── k8s                     Kubernetes 部署配置文件。
├── jest.config.js              Jest 测试框架的配置文件。
├── lib                         编译后的 JavaScript 文件存放目录。
├── package-lock.json           锁定项目依赖的具体版本。
├── package.json                项目的配置文件，包含项目的依赖、脚本等信息。
├── release.sh                  项目发布脚本。
├── src                         源代码目录，包含各个模块的 TypeScript 源文件。
│   ├── Limiter
│   │   ├── FineGrainedRateLimiter.ts    细粒度限流器实现。
│   │   ├── FixedWindowRateLimiter.ts    固定窗口限流器实现。
│   │   ├── LeakyBucketRateLimiter.ts    漏桶限流器实现。
│   │   ├── SlidingWindowRateLimiter.ts  滑动窗口限流器实现。
│   │   └── TokenBucketRateLimiter.ts    令牌桶限流器实现。
│   ├── Lock
│   │   └── RedisLock.ts                 Redis 锁实现。
│   ├── Ranking
│   │   ├── CompositeLeaderboard.ts      复合排行榜实现。
│   │   ├── Leaderboard.ts               排行榜实现。
│   │   └── RatingSystem.ts              评分系统实现。
│   ├── RedisMonitor
│   │   └── RedisMonitor.ts              Redis 监控模块实现。
│   ├── Redisearch
│   │   └── ArticlePlagiarismDetector.ts 文章抄袭检测器实现。
│   ├── Statistic
│   │   ├── base.ts                      统计模块基础实现。
│   │   └── busines.ts                   业务统计实现。
│   ├── TSRedisCacheKit
│   │   ├── BitField.ts                  BitField 缓存实现。
│   │   ├── Hash.ts                      Hash 缓存实现。
│   │   ├── HyperLogLog.ts               HyperLogLog 缓存实现。
│   │   ├── List.ts                      List 缓存实现。
│   │   ├── PubSub.ts                    发布订阅实现。
│   │   ├── Set.ts                       Set 缓存实现。
│   │   ├── SortedSet.ts                 SortedSet 缓存实现。
│   │   ├── String.ts                    String 缓存实现。
│   │   └── base.ts                      缓存基础实现。
│   ├── index.ts                         项目入口文件。
│   ├── test
│   │   └── index.ts                     测试入口文件。
│   ├── tools
│   │   └── time.ts                      时间工具实现。
│   └── type.d.ts                        类型定义文件。
├── test                        测试文件目录。
├── tree-out.txt                项目目录结构的输出文件。
├── tsconfig.build.json         用于构建的 TypeScript 配置文件。
└── tsconfig.json               TypeScript 编译器配置文件。
```

## 安装

请确保已安装 [Node.js](https://nodejs.org/) 和 [npm](https://www.npmjs.com/)。

```bash
npm install temp-redis-tools
```

## 使用方法

### 基础封装

`BaseCache`类

#### 1. 创建缓存实例

```typescript
import { Redis } from "ioredis";
import { BaseCache } from "temp-redis-tools"; 

const redisClient = new Redis();
const cacheOption = { appName: "testApp", funcName: "testFunc" };
const cache = new BaseCache("testPrefix", cacheOption, redisClient);
```

#### 2. 创建缓存键

```typescript
const keyWithoutSuffix = cache.createKey(); // "testPrefix-testApp-testFunc"
const keyWithSuffix = cache.createKey("123"); // "testPrefix-testApp-testFunc-123"
```

#### 3. 将数据转换为字符串

```typescript
const stringData = cache.dataToString({ key: "value" }); // '{"key":"value"}'
const booleanData = cache.dataToString(true); // "true"
const numberData = cache.dataToString(123); // "123"
```

#### 4. 创建管道操作

```typescript
const pipeline = cache.createPipeline();
// 在 pipeline 中添加命令
pipeline.set("key1", "value1");
pipeline.set("key2", "value2");
// 执行管道操作
pipeline.exec((err, results) => {
  if (err) {
    console.error("Pipeline execution error:", err);
  } else {
    console.log("Pipeline execution results:", results);
  }
});
```

#### 5. 执行事务操作

```typescript
async function executeTransactionExample() {
  await cache.executeTransaction(pipeline => {
    pipeline.set("key1", "value1");
    pipeline.set("key2", "value2");
  }).then(results => {
    console.log("Transaction execution results:", results);
  }).catch(err => {
    console.error("Transaction execution error:", err);
  });
}

executeTransactionExample();
```

#### 6. 清除所有缓存

```ts
async function clearAllCacheExample() {
  await cache.clearAllCache().then(() => {
    console.log("All cache cleared.");
  }).catch(err => {
    console.error("Error clearing cache:", err);
  });
}

clearAllCacheExample();
```

#### 7. 处理没有键的清除缓存

```ts
async function clearAllCacheNoKeysExample() {
  // 假设没有键存在
  await cache.clearAllCache().then(() => {
    console.log("All cache cleared (no keys).");
  }).catch(err => {
    console.error("Error clearing cache (no keys):", err);
  });
}

clearAllCacheNoKeysExample();
```

### `CacheString` 类

`CacheString` 类继承自 `BaseCache`，提供了一系列操作 Redis 字符串类型数据的方法。

#### 1. 设置字符串值

```typescript
const cacheString = new CacheString("testPrefix", cacheOption, redisClient);

// 设置带过期时间的值
await cacheString.set("myKey", "myValue", 3600); // 设置 myKey 的值为 myValue，过期时间为 3600 秒

// 设置不带过期时间的值
await cacheString.set("myKey", "myValue");
```

#### 2. 获取字符串值

```typescript
const value = await cacheString.get("myKey"); // 获取 myKey 的值
console.log(value); // 输出: myValue
```

#### 3. 检查键是否存在

```typescript
const exists = await cacheString.exists("myKey"); // 检查 myKey 是否存在
console.log(exists); // 输出: 1（存在）或 0（不存在）
```

#### 4. 删除键

```typescript
const deleted = await cacheString.delete("myKey"); // 删除 myKey
console.log(deleted); // 输出: 1（删除成功）或 0（键不存在）
```

#### 5. 增加键的值

```typescript
await cacheString.set("counter", 1); // 设置初始值
const newValue = await cacheString.increment("counter", 2); // 增加 counter 的值 2
console.log(newValue); // 输出: 3
```

#### 6. 减少键的值

```typescript
await cacheString.set("counter", 3); // 设置初始值
const newValue = await cacheString.decrement("counter", 1); // 减少 counter 的值 1
console.log(newValue); // 输出: 2
```

#### 7. 获取并设置新值

```typescript
await cacheString.set("myKey", "oldValue"); // 设置初始值
const oldValue = await cacheString.getSet("myKey", "newValue"); // 获取旧值，并设置新值
console.log(oldValue); // 输出: oldValue
```

#### 8. 设置多个键值对

```typescript
const keyValuePairs = [
  { key: "key1", value: "value1" },
  { key: "key2", value: "value2" },
];
await cacheString.setMultiple(keyValuePairs); // 设置多个键值对
```

#### 9. 获取多个键值对

```typescript
const keys = ["key1", "key2"];
const values = await cacheString.getMultiple(keys); // 获取多个键值对
console.log(values); // 输出: ["value1", "value2"]
```

#### 10. 设置键值对，如果键不存在

```typescript
const setnxResult = await cacheString.setnx("uniqueKey", "uniqueValue"); // 只有在 uniqueKey 不存在时才设置
console.log(setnxResult); // 输出: 1（设置成功）或 0（键已存在）
```

#### 11. 设置键值对，如果键不存在，并设置过期时间

```typescript
const setnxWithExpireResult = await cacheString.setnxWithExpire("uniqueKey", "uniqueValue", 3600); // 只有在 uniqueKey 不存在时才设置，并设置过期时间
console.log(setnxWithExpireResult); // 输出: "OK"（设置成功）或 null（键已存在）
```

### `CacheList` 类

`CacheList` 类继承自 `BaseCache`，提供了一系列操作 Redis 列表类型数据的方法。

#### 1. 从右侧推入元素到列表

```typescript
const cacheList = new CacheList("testPrefix", cacheOption, redisClient);

// 推入单个元素
await cacheList.push("myList", "element1");

// 推入多个元素
await cacheList.push("myList", "element2", "element3");
```

#### 2. 从右侧弹出元素

```typescript
const poppedElement = await cacheList.pop("myList"); // 从 myList 列表右侧弹出元素
console.log(poppedElement); // 输出: element3
```

#### 3. 获取列表的长度

```typescript
const length = await cacheList.length("myList"); // 获取 myList 列表的长度
console.log(length); // 输出: 2
```

#### 4. 获取列表的指定范围内的元素

```typescript
const elements = await cacheList.range(0, -1, "myList"); // 获取 myList 列表中的所有元素
console.log(elements); // 输出: ["element1", "element2"]
```

#### 5. 从左侧推入元素到列表

```typescript
// 推入单个元素
await cacheList.lpush("myList", "element0");

// 推入多个元素
await cacheList.lpush("myList", "element-2", "element-1");
```

#### 6. 从左侧弹出元素

```typescript
const lPoppedElement = await cacheList.lpop("myList"); // 从 myList 列表左侧弹出元素
console.log(lPoppedElement); // 输出: element-2
```

#### 7. 修剪列表，只保留指定范围内的元素

```typescript
await cacheList.trim(0, 1, "myList"); // 只保留 myList 列表中的前两个元素
const trimmedElements = await cacheList.range(0, -1, "myList");
console.log(trimmedElements); // 输出: ["element-1", "element0"]
```

#### 8. 设置指定索引处的值

```typescript
await cacheList.set(0, "newElement0", "myList"); // 设置 myList 列表中索引 0 处的值
const updatedElements = await cacheList.range(0, -1, "myList");
console.log(updatedElements); // 输出: ["newElement0", "element0"]
```

#### 9. 根据值移除元素

```typescript
await cacheList.push("myList", "elementToRemove");
const removedCount = await cacheList.remove(1, "elementToRemove", "myList"); // 移除 myList 列表中第一个 "elementToRemove"
console.log(removedCount); // 输出: 1
```

#### 10. 在指定元素前或后插入新元素

```typescript
await cacheList.push("myList", "pivotElement");

// 在 pivotElement 前插入新元素
await cacheList.insert("pivotElement", "beforeElement", "BEFORE", "myList");

// 在 pivotElement 后插入新元素
await cacheList.insert("pivotElement", "afterElement", "AFTER", "myList");

const finalElements = await cacheList.range(0, -1, "myList");
console.log(finalElements); // 输出: ["newElement0", "element0", "beforeElement", "pivotElement", "afterElement"]
```

### `CacheHash` 类

`CacheHash` 类继承自 `BaseCache`，提供了一系列操作 Redis 哈希表类型数据的方法。

#### 1. 设置哈希表中的字段值

```typescript
const cacheHash = new CacheHash("testPrefix", cacheOption, redisClient);

// 设置字段值
const success = await cacheHash.set("field1", { name: "Alice", age: 30 }, "myHash");
console.log(success); // 输出: true
```

#### 2. 获取哈希表中的字段值

```typescript
const value = await cacheHash.get("field1", "myHash");
console.log(value); // 输出: { name: "Alice", age: 30 }
```

#### 3. 获取哈希表中的所有字段和值

```typescript
const allValues = await cacheHash.getAll("myHash");
console.log(allValues); // 输出: { field1: { name: "Alice", age: 30 } }
```

#### 4. 检查哈希表中是否存在指定字段

```typescript
const exists = await cacheHash.exists("field1", "myHash");
console.log(exists); // 输出: 1（存在）或 0（不存在）
```

#### 5. 删除哈希表中的指定字段

```typescript
const deleted = await cacheHash.delete("field1", "myHash");
console.log(deleted); // 输出: true（删除成功）或 false（字段不存在）
```

#### 6. 获取哈希表中所有字段的数量

```typescript
const length = await cacheHash.length("myHash");
console.log(length); // 输出: 0（如果没有字段）或其他数字（字段数量）
```

#### 7. 获取哈希表中的所有字段名

```typescript
const keys = await cacheHash.keys("myHash");
console.log(keys); // 输出: ["field1", "field2", ...]
```

#### 8. 获取哈希表中的所有字段值

```typescript
const values = await cacheHash.values("myHash");
console.log(values); // 输出: [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }, ...]
```

#### 9. 为哈希表中的字段值加上指定增量

```typescript
await cacheHash.set("counter", { count: 10 }, "myHash");
const newValue = await cacheHash.incrementBy("counter", 5, "myHash");
console.log(newValue); // 输出: 15
```

#### 10. 为哈希表中的字段值加上指定浮点增量

```typescript
await cacheHash.set("floatCounter", { count: 10.5 }, "myHash");
const newFloatValue = await cacheHash.incrementByFloat("floatCounter", 2.5, "myHash");
console.log(newFloatValue); // 输出: "13.0"
```

### `CacheSet` 类

`CacheSet` 类继承自 `BaseCache`，提供了一系列操作 Redis 集合类型数据的方法。

#### 1. 添加一个元素到集合

```typescript
const cacheSet = new CacheSet("testPrefix", cacheOption, redisClient);

// 添加单个元素
const success = await cacheSet.add("element1", "mySet");
console.log(success); // 输出: true
```

#### 2. 批量添加元素到集合

```typescript
const successBatch = await cacheSet.addBatch(["element2", "element3"], "mySet");
console.log(successBatch); // 输出: true
```

#### 3. 从集合中移除一个元素

```typescript
const removed = await cacheSet.remove("element1", "mySet");
console.log(removed); // 输出: true
```

#### 4. 批量移除集合中的元素

```typescript
const removedBatch = await cacheSet.removeBatch(["element2", "element3"], "mySet");
console.log(removedBatch); // 输出: true
```

#### 5. 获取集合中的所有元素

```typescript
const members = await cacheSet.members("mySet");
console.log(members); // 输出: ["element1", "element2", "element3"]
```

#### 6. 检查元素是否在集合中

```typescript
const exists = await cacheSet.exists("element1", "mySet");
console.log(exists); // 输出: 1（存在）或 0（不存在）
```

#### 7. 获取集合的大小

```typescript
const size = await cacheSet.size("mySet");
console.log(size); // 输出: 3
```

#### 8. 随机弹出一个元素

```typescript
const poppedElement = await cacheSet.pop("mySet");
console.log(poppedElement); // 输出: 随机弹出的元素
```

#### 9. 随机弹出多个元素

```typescript
const poppedElements = await cacheSet.popMultiple(2, "mySet");
console.log(poppedElements); // 输出: 随机弹出的两个元素
```

#### 10. 随机获取一个元素

```typescript
const randomElement = await cacheSet.randomMember("mySet");
console.log(randomElement); // 输出: 随机获取的元素
```

#### 11. 随机获取多个元素

```typescript
const randomElements = await cacheSet.randomMembers(2, "mySet");
console.log(randomElements); // 输出: 随机获取的两个元素
```

#### 12. 获取多个集合的并集

```typescript
const unionResult = await cacheSet.union("set1", "set2");
console.log(unionResult); // 输出: 并集结果
```

#### 13. 获取多个集合的交集

```typescript
const intersectResult = await cacheSet.intersect("set1", "set2");
console.log(intersectResult); // 输出: 交集结果
```

#### 14. 获取多个集合的差集

```typescript
const differenceResult = await cacheSet.difference("set1", "set2");
console.log(differenceResult); // 输出: 差集结果
```

### `CacheSortedSet` 类

`CacheSortedSet` 类继承自 `BaseCache`，提供了一系列操作 Redis 有序集合类型数据的方法。

#### 1. 添加一个成员到有序集合

```typescript
const cacheSortedSet = new CacheSortedSet("testPrefix", cacheOption, redisClient);

// 添加单个成员
const success = await cacheSortedSet.add(10, "member1", "mySortedSet");
console.log(success); // 输出: true
```

#### 2. 添加多个成员到有序集合

```typescript
const members: ZMember[] = [
  { score: 20, value: "member2" },
  { score: 30, value: "member3" }
];
const successBatch = await cacheSortedSet.adds(members, "mySortedSet");
console.log(successBatch); // 输出: true
```

#### 3. 移除有序集合中的一个成员

```typescript
const removed = await cacheSortedSet.remove("member1", "mySortedSet");
console.log(removed); // 输出: true
```

#### 4. 计算有序集合中指定分数范围的成员数量

```typescript
const count = await cacheSortedSet.count(10, 30, "mySortedSet");
console.log(count); // 输出: 2
```

#### 5. 获取有序集合中指定分数范围的成员

```typescript
const membersInRange = await cacheSortedSet.rangeByScore(10, 30, "mySortedSet");
console.log(membersInRange); // 输出: ["member1", "member2", "member3"]
```

#### 6. 获取有序集合中的元素数量

```typescript
const length = await cacheSortedSet.length("mySortedSet");
console.log(length); // 输出: 3
```

#### 7. 获取有序集合中指定范围内的元素

```typescript
const range = await cacheSortedSet.range(0, 2, "mySortedSet");
console.log(range); // 输出: ["member1", "member2", "member3"]
```

#### 8. 获取有序集合中指定范围内的元素及其分数

```typescript
const rangeWithScores = await cacheSortedSet.rangeWithScores(0, 2, "mySortedSet");
console.log(rangeWithScores); // 输出: [{ value: "member1", score: 10 }, { value: "member2", score: 20 }, { value: "member3", score: 30 }]
```

#### 9. 获取有序集合中指定成员的分数

```typescript
const score = await cacheSortedSet.score("member1", "mySortedSet");
console.log(score); // 输出: 10
```

#### 10. 为有序集合中的成员的分数加上指定增量

```typescript
const newScore = await cacheSortedSet.incrementBy("member1", 5, "mySortedSet");
console.log(newScore); // 输出: 15
```

#### 11. 删除有序集合中指定分数范围的成员

```typescript
const removedByScore = await cacheSortedSet.removeRangeByScore(10, 30, "mySortedSet");
console.log(removedByScore); // 输出: 3
```

#### 12. 删除有序集合中指定排名范围的成员

```typescript
const removedByRank = await cacheSortedSet.removeRangeByRank(0, 2, "mySortedSet");
console.log(removedByRank); // 输出: 3
```

### `CacheHyperLogLog` 类

`CacheHyperLogLog` 类继承自 `BaseCache`，提供了一系列操作 Redis HyperLogLog 数据结构的方法。

#### 1. 添加元素到 HyperLogLog

```typescript
const cacheHyperLogLog = new CacheHyperLogLog("testPrefix", cacheOption, redisClient);

// 添加单个或多个元素
const success = await cacheHyperLogLog.add("myHyperLogLog", "element1", "element2");
console.log(success); // 输出: true
```

#### 2. 获取 HyperLogLog 中的基数估算值

```typescript
const count = await cacheHyperLogLog.count("myHyperLogLog");
console.log(count); // 输出: 基数估算值
```

#### 3. 合并多个 HyperLogLog

```typescript
const successMerge = await cacheHyperLogLog.merge("mergedHyperLogLog", "hyperLogLog1", "hyperLogLog2");
console.log(successMerge); // 输出: true
```

#### 4. 删除 HyperLogLog

```typescript
const successDelete = await cacheHyperLogLog.delete("myHyperLogLog");
console.log(successDelete); // 输出: true
```

#### 5. 重命名 HyperLogLog

```typescript
const successRename = await cacheHyperLogLog.rename("oldHyperLogLog", "newHyperLogLog");
console.log(successRename); // 输出: true
```

#### 6. 获取 HyperLogLog 的内存使用情况

```typescript
const memoryUsage = await cacheHyperLogLog.memoryUsage("myHyperLogLog");
console.log(memoryUsage); // 输出: 内存使用情况（字节）
```

### `CacheBitField` 类

`CacheBitField` 类继承自 `BaseCache`，提供了一系列操作 Redis 位域（BitField）数据结构的方法。

#### 1. 设置位域的某一位

```typescript
const cacheBitField = new CacheBitField("testPrefix", cacheOption, redisClient);

// 设置某一位
const previousValue = await cacheBitField.setbit(5, true, "myBitField");
console.log(previousValue); // 输出: 之前的位值 (0 或 1)
```

#### 2. 获取位域的某一位

```typescript
const bitValue = await cacheBitField.getbit(5, "myBitField");
console.log(bitValue); // 输出: 当前位值 (0 或 1)
```

#### 3. 计算位域中指定范围内的位数

```typescript
const option: BitCountRange = { start: 0, end: -1, mode: "BYTE" };
const bitCount = await cacheBitField.count(option, "myBitField");
console.log(bitCount); // 输出: 指定范围内的位数
```

#### 4. 对位域执行位操作

```typescript
const operation = "AND";
const destKey = "resultBitField";
const keys = ["bitField1", "bitField2"];
const resultBitCount = await cacheBitField.bitop(operation, destKey, keys);
console.log(resultBitCount); // 输出: 结果位数
```

### `PubSubRedis` 类

`PubSubRedis` 类继承自 `BaseCache`，提供了基于 Redis 的发布/订阅功能，支持消息的订阅、取消订阅、发布、持久化到文件及重试机制。

#### 1. 创建发布/订阅实例

```typescript
import { Redis } from "ioredis";
import { PubSubRedis } from "temp-redis-tools"; 

const redisClient = new Redis();
const cacheOption = { appName: "testApp", funcName: "testFunc" };
const pubSub = new PubSubRedis("testPrefix", cacheOption, redisClient);
```

#### 2. 订阅频道

```typescript
async function subscribeExample() {
  await pubSub.subscribe("testChannel", (message, channel) => {
    console.log(`Received message: ${message} from channel: ${channel}`);
  });
}

subscribeExample();
```

#### 3. 取消订阅频道

```typescript
async function unsubscribeExample() {
  await pubSub.unsubscribe("testChannel");
}

unsubscribeExample();
```

#### 4. 模式订阅

```typescript
async function psubscribeExample() {
  await pubSub.psubscribe("test*", (message, channel) => {
    console.log(`Received message: ${message} from channel: ${channel}`);
  });
}

psubscribeExample();
```

#### 5. 取消模式订阅

```typescript
async function punsubscribeExample() {
  await pubSub.punsubscribe("test*");
}

punsubscribeExample();
```

#### 6. 发布消息

```typescript
async function publishExample() {
  await pubSub.publish("testChannel", "Hello, World!");
}

publishExample();
```

#### 7. 持久化消息

```typescript
async function persistMessageExample() {
  await pubSub.persistMessage("testChannel", "Persisted message");
}

persistMessageExample();
```

#### 8. 重试消息

```typescript
async function retryMessageExample() {
  await pubSub.retryMessage("testChannel", "Retry this message", 3);
}

retryMessageExample();
```

#### 9. 关闭连接

```typescript
async function closeExample() {
  await pubSub.close();
}

closeExample();
```

### 完整示例

以下是一个完整的使用示例，展示了如何创建一个 `PubSubRedis` 实例，并进行订阅、发布、持久化和重试消息等操作。

```typescript
import { Redis } from "ioredis";
import { PubSubRedis } from "temp-redis-tools"; 

async function main() {
  const redisClient = new Redis();
  const cacheOption = { appName: "testApp", funcName: "testFunc" };
  const pubSub = new PubSubRedis("testPrefix", cacheOption, redisClient);

  // 订阅频道
  await pubSub.subscribe("testChannel", (message, channel) => {
    console.log(`Received message: ${message} from channel: ${channel}`);
  });

  // 发布消息
  await pubSub.publish("testChannel", "Hello, World!");

  // 持久化消息
  await pubSub.persistMessage("testChannel", "Persisted message");

  // 重试消息
  await pubSub.retryMessage("testChannel", "Retry this message", 3);

  // 取消订阅频道
  await pubSub.unsubscribe("testChannel");

  // 关闭连接
  await pubSub.close();
}

main().catch(console.error);
```