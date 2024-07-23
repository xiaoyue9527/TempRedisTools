/* eslint-disable @typescript-eslint/no-empty-function */
import { PubSubRedis } from "../src/TSRedisCacheKit/PubSub";
import { Redis as RedisClient } from "ioredis";
import { promises as fs } from "fs";
import path from "path";
import { CacheOption } from "../src/type";

// Mock ioredis
jest.mock("ioredis", () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      duplicate: jest.fn().mockReturnThis(),
      on: jest.fn(),
      connect: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      psubscribe: jest.fn(),
      punsubscribe: jest.fn(),
      publish: jest.fn(),
      quit: jest.fn(),
    })),
  };
});

// Mock fs
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    appendFile: jest.fn(),
  },
}));

const MockRedisClient = RedisClient as jest.MockedClass<typeof RedisClient>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe("PubSubRedis", () => {
  let pubSubRedis: PubSubRedis;
  let redisClient: jest.Mocked<RedisClient>;
  const cacheOption: CacheOption = { appName: "testApp", funcName: "testFunc" };

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    redisClient = new MockRedisClient() as jest.Mocked<RedisClient>;
    pubSubRedis = new PubSubRedis("testPrefix", cacheOption, redisClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should subscribe to a channel", async () => {
    const listener = jest.fn();
    await pubSubRedis.subscribe("testChannel", listener);
    expect(redisClient.subscribe).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testChannel"
    );
    expect(
      pubSubRedis["listeners"].get("testPrefix-testApp-testFunc-testChannel")
    ).toBe(listener);
  });

  test("should unsubscribe from a channel", async () => {
    const listener = jest.fn();
    await pubSubRedis.subscribe("testChannel", listener);
    await pubSubRedis.unsubscribe("testChannel");
    expect(redisClient.unsubscribe).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testChannel"
    );
    expect(
      pubSubRedis["listeners"].has("testPrefix-testApp-testFunc-testChannel")
    ).toBe(false);
  });

  test("should psubscribe to a pattern", async () => {
    const listener = jest.fn();
    await pubSubRedis.psubscribe("testPattern", listener);
    expect(redisClient.psubscribe).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testPattern"
    );
    expect(
      pubSubRedis["listeners"].get("testPrefix-testApp-testFunc-testPattern")
    ).toBe(listener);
  });

  test("should punsubscribe from a pattern", async () => {
    const listener = jest.fn();
    await pubSubRedis.psubscribe("testPattern", listener);
    await pubSubRedis.punsubscribe("testPattern");
    expect(redisClient.punsubscribe).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testPattern"
    );
    expect(
      pubSubRedis["listeners"].has("testPrefix-testApp-testFunc-testPattern")
    ).toBe(false);
  });

  test("should publish a message to a channel", async () => {
    await pubSubRedis.publish("testChannel", "testMessage");
    expect(redisClient.publish).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testChannel",
      "testMessage"
    );
  });

  test("should persist a message to a file", async () => {
    const filePath = path.join(
      process.cwd(),
      "data",
      "testPrefix-testApp-testFunc-testChannel.log"
    );
    await pubSubRedis.persistMessage("testChannel", "testMessage");
    expect(mockFs.mkdir).toHaveBeenCalledWith(path.dirname(filePath), {
      recursive: true,
    });
    expect(mockFs.appendFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("testMessage")
    );
  });

  test("should retry sending a message", async () => {
    // Temporarily disable console.log and console.error
    console.log = jest.fn();
    console.error = jest.fn();

    const listener = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("Failed");
      })
      .mockImplementationOnce(() => {
        /* succeed */
      });

    await pubSubRedis.subscribe("testChannel", listener);
    await pubSubRedis.retryMessage("testChannel", "testMessage", 3);

    // Expect listener to have been called twice: once failed, once succeeded
    expect(listener).toHaveBeenCalledTimes(2);

    // Restore original console.log and console.error
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  test("should handle error when subscribing to a channel", async () => {
    const listener = jest.fn();
    redisClient.subscribe.mockImplementationOnce(() => {
      throw new Error("Subscribe Error");
    });

    await expect(
      pubSubRedis.subscribe("testChannel", listener)
    ).rejects.toThrow("Subscribe Error");
    expect(redisClient.subscribe).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testChannel"
    );
  });

  test("should handle error when unsubscribing from a channel", async () => {
    const listener = jest.fn();
    await pubSubRedis.subscribe("testChannel", listener);
    redisClient.unsubscribe.mockImplementationOnce(() => {
      throw new Error("Unsubscribe Error");
    });

    await expect(pubSubRedis.unsubscribe("testChannel")).rejects.toThrow(
      "Unsubscribe Error"
    );
    expect(redisClient.unsubscribe).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testChannel"
    );
  });

  test("should handle error when publishing a message", async () => {
    redisClient.publish.mockImplementationOnce(() => {
      throw new Error("Publish Error");
    });

    await expect(
      pubSubRedis.publish("testChannel", "testMessage")
    ).rejects.toThrow("Publish Error");
    expect(redisClient.publish).toHaveBeenCalledWith(
      "testPrefix-testApp-testFunc-testChannel",
      "testMessage"
    );
  });

  test("should handle error when persisting a message", async () => {
    mockFs.mkdir.mockRejectedValueOnce(new Error("Mkdir Error"));

    await expect(
      pubSubRedis.persistMessage("testChannel", "testMessage")
    ).rejects.toThrow("Mkdir Error");

    const filePath = path.join(
      process.cwd(),
      "data",
      "testPrefix-testApp-testFunc-testChannel.log"
    );
    expect(mockFs.mkdir).toHaveBeenCalledWith(path.dirname(filePath), {
      recursive: true,
    });
  });

  test("should close the subscriber connection", async () => {
    await pubSubRedis.close();
    expect(redisClient.quit).toHaveBeenCalled();
  });

  test("should log error when publish fails", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    redisClient.publish.mockRejectedValueOnce(new Error("Publish Error"));

    await pubSubRedis.publish("testChannel", "testMessage").catch(() => {});

    expect(console.error).toHaveBeenCalledWith(
      `Failed to publish message: testMessage to channel: testPrefix-testApp-testFunc-testChannel`,
      expect.any(Error)
    );

    console.error = originalConsoleError;
  });

  test("should log error when subscribe fails", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    redisClient.subscribe.mockRejectedValueOnce(new Error("Subscribe Error"));

    await pubSubRedis.subscribe("testChannel", jest.fn()).catch(() => {});

    expect(console.error).toHaveBeenCalledWith(
      `Failed to subscribe to channel: testPrefix-testApp-testFunc-testChannel`,
      expect.any(Error)
    );

    console.error = originalConsoleError;
  });

  test("should log error when psubscribe fails", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    redisClient.psubscribe.mockRejectedValueOnce(new Error("Psubscribe Error"));

    await pubSubRedis.psubscribe("testPattern", jest.fn()).catch(() => {});

    expect(console.error).toHaveBeenCalledWith(
      `Failed to psubscribe to pattern: testPrefix-testApp-testFunc-testPattern`,
      expect.any(Error)
    );

    console.error = originalConsoleError;
  });

  test("should log error when unsubscribe fails", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    redisClient.unsubscribe.mockRejectedValueOnce(
      new Error("Unsubscribe Error")
    );

    await pubSubRedis.unsubscribe("testChannel").catch(() => {});

    expect(console.error).toHaveBeenCalledWith(
      `Failed to unsubscribe from channel: testPrefix-testApp-testFunc-testChannel`,
      expect.any(Error)
    );

    console.error = originalConsoleError;
  });

  test("should log error when punsubscribe fails", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    redisClient.punsubscribe.mockRejectedValueOnce(
      new Error("Punsubscribe Error")
    );

    await pubSubRedis.punsubscribe("testPattern").catch(() => {});

    expect(console.error).toHaveBeenCalledWith(
      `Failed to punsubscribe from pattern: testPrefix-testApp-testFunc-testPattern`,
      expect.any(Error)
    );

    console.error = originalConsoleError;
  });
});
