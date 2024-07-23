import { Redis as RedisClient } from "ioredis";
import { CacheOption } from "../src/type";
import { UniqueIPStatistic, UserSignInStatistic, PageViewStatistic, UserActionCountStatistic, NewUserStatistic } from "../src/Statistic/busines";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      pfadd: jest.fn().mockResolvedValue(1),
      pfcount: jest.fn().mockResolvedValue(10),
      setbit: jest.fn().mockResolvedValue(1),
      getbit: jest.fn().mockResolvedValue(1),
      bitcount: jest.fn().mockResolvedValue(5),
      incr: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue("100"),
    })),
  };
});

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;

describe("UniqueIPStatistic", () => {
  let uniqueIPStatistic: UniqueIPStatistic;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    uniqueIPStatistic = new UniqueIPStatistic("testPrefix", cacheOption, redisClient);

    // Mock Date to return a consistent value
    jest.useFakeTimers().setSystemTime(new Date("2024-07-23T00:00:00Z"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("should add a unique IP", async () => {
    await uniqueIPStatistic.add("192.168.0.1");
    expect(redisClient.pfadd).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-unique-ip", "192.168.0.1");
  });

  test("should get the count of unique IPs", async () => {
    const count = await uniqueIPStatistic.getCount();
    expect(redisClient.pfcount).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-unique-ip");
    expect(count).toBe(10);
  });
});

describe("UserSignInStatistic", () => {
  let userSignInStatistic: UserSignInStatistic;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    userSignInStatistic = new UserSignInStatistic("testPrefix", cacheOption, redisClient);

    // Mock Date to return a consistent value
    jest.useFakeTimers().setSystemTime(new Date("2024-07-23T00:00:00Z"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("should add a user sign-in record", async () => {
    await userSignInStatistic.add("user1");
    expect(redisClient.setbit).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-user1", 23, 1);
  });

  test("should get the count of sign-in users", async () => {
    const count = await userSignInStatistic.getCount();
    expect(redisClient.bitcount).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-user-sign-in");
    expect(count).toBe(5);
  });

  test("should get user sign-in status", async () => {
    const status = await userSignInStatistic.getSignInStatus("user1");
    expect(redisClient.getbit).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-user1", 23);
    expect(status).toBe(true);
  });

  test("should get user sign-in count", async () => {
    const count = await userSignInStatistic.getSignInCount("user1");
    expect(redisClient.bitcount).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-user1");
    expect(count).toBe(5);
  });
});

describe("PageViewStatistic", () => {
  let pageViewStatistic: PageViewStatistic;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    pageViewStatistic = new PageViewStatistic("testPrefix", cacheOption, redisClient);

    // Mock Date to return a consistent value
    jest.useFakeTimers().setSystemTime(new Date("2024-07-23T00:00:00Z"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("should add a page view", async () => {
    await pageViewStatistic.add();
    expect(redisClient.incr).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-page-view");
  });

  test("should get the count of page views", async () => {
    const count = await pageViewStatistic.getCount();
    expect(redisClient.get).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-page-view");
    expect(count).toBe(100);
  });
});

describe("UserActionCountStatistic", () => {
  let userActionCountStatistic: UserActionCountStatistic;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    userActionCountStatistic = new UserActionCountStatistic("testPrefix", cacheOption, redisClient);

    // Mock Date to return a consistent value
    jest.useFakeTimers().setSystemTime(new Date("2024-07-23T00:00:00Z"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("should add a user action count", async () => {
    await userActionCountStatistic.add();
    expect(redisClient.incr).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-user-action");
  });

  test("should get the count of user actions", async () => {
    const count = await userActionCountStatistic.getCount();
    expect(redisClient.get).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-user-action");
    expect(count).toBe(100);
  });
});

describe("NewUserStatistic", () => {
  let newUserStatistic: NewUserStatistic;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    newUserStatistic = new NewUserStatistic("testPrefix", cacheOption, redisClient);

    // Mock Date to return a consistent value
    jest.useFakeTimers().setSystemTime(new Date("2024-07-23T00:00:00Z"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("should add a new user", async () => {
    await newUserStatistic.add("user1");
    expect(redisClient.pfadd).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-new-user", "user1");
  });

  test("should get the count of new users", async () => {
    const count = await newUserStatistic.getCount();
    expect(redisClient.pfcount).toHaveBeenCalledWith("testPrefix-testApp-testFunc-2024-07-23-new-user");
    expect(count).toBe(10);
  });
});
