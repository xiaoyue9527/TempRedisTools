import { ArticlePlagiarismDetector } from "../src/Redisearch/ArticlePlagiarismDetector";
import { createClient, RedisClientType } from "redis";

// Mock redis
jest.mock("redis", () => {
  const mRedisClient = {
    connect: jest.fn(),
    quit: jest.fn(),
    sAdd: jest.fn(),
    sMembers: jest.fn().mockResolvedValue([]),
  };
  return {
    createClient: jest.fn(() => mRedisClient),
  };
});

describe("ArticlePlagiarismDetector", () => {
  let detector: ArticlePlagiarismDetector;
  let redisClient: jest.Mocked<RedisClientType>;

  beforeEach(() => {
    detector = new ArticlePlagiarismDetector(
      "redis://localhost:6379",
      3,
      100,
      20
    );
    redisClient = createClient() as jest.Mocked<RedisClientType>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to redis", async () => {
    await detector.connect();
    expect(redisClient.connect).toHaveBeenCalled();
  });

  it("should disconnect from redis", async () => {
    await detector.disconnect();
    expect(redisClient.quit).toHaveBeenCalled();
  });

  it("should create shingles", () => {
    const text = "hello world";
    const shingles = detector["shingles"](text);
    expect(shingles).toEqual(["hel", "ell", "llo", "lo ", "o w", " wo", "wor", "orl", "rld"]);
  });

  it("should hash shingles", () => {
    const shingle = "hello";
    const hashes = detector["hashShingle"](shingle);
    expect(hashes.length).toBe(100);
  });

  it("should create min hash signature", () => {
    const shingles = ["hel", "ell", "llo"];
    const signature = detector["minHashSignature"](shingles);
    expect(signature.length).toBe(100);
  });

  it("should store signature in LSH", async () => {
    const signature = Array(100).fill(0);
    await detector["storeSignatureLSH"]("bucket", "article1", signature);
    expect(redisClient.sAdd).toHaveBeenCalledTimes(20); // numBands
  });

  it("should throw error for invalid signature length", async () => {
    const invalidSignature = Array(99).fill(0);
    await expect(detector["storeSignatureLSH"]("bucket", "article1", invalidSignature))
      .rejects
      .toThrow("Invalid signature length: expected 100, got 99");
  });

  it("should retrieve candidates from LSH", async () => {
    const signature = Array(100).fill(0);
    const validCandidate = JSON.stringify({ articleId: "article1", signature: Array(100).fill(0) });
    redisClient.sMembers.mockResolvedValueOnce([validCandidate]);
    const candidates = await detector["retrieveCandidatesLSH"]("bucket", signature);
    expect(candidates.length).toBe(1);
    expect(candidates[0].articleId).toBe("article1");
  });

  it("should handle invalid candidate signature", async () => {
    const signature = Array(100).fill(0);
    const invalidCandidate = JSON.stringify({ articleId: "article1", signature: Array(99).fill(0) });
    redisClient.sMembers.mockResolvedValueOnce([invalidCandidate]);
    const candidates = await detector["retrieveCandidatesLSH"]("bucket", signature);
    expect(candidates.length).toBe(0);
  });

  it("should handle parsing error in retrieveCandidatesLSH", async () => {
    const signature = Array(100).fill(0);
    const invalidJSON = '{"articleId": "article1", "signature": [0,0,0';
    redisClient.sMembers.mockResolvedValueOnce([invalidJSON]);
    const candidates = await detector["retrieveCandidatesLSH"]("bucket", signature);
    expect(candidates.length).toBe(0);
  });

  it("should calculate Jaccard similarity", () => {
    const signature1 = [1, 2, 3, 4, 5];
    const signature2 = [1, 2, 3, 4, 6];
    const similarity = detector["jaccardSimilarity"](signature1, signature2);
    expect(similarity).toBe(0.8);
  });

  it("should throw error for null or undefined signatures in jaccardSimilarity", () => {
    expect(() => detector["jaccardSimilarity"](null as any, [1, 2, 3])).toThrow("Signatures cannot be null or undefined");
    expect(() => detector["jaccardSimilarity"]([1, 2, 3], undefined as any)).toThrow("Signatures cannot be null or undefined");
  });

  it("should throw error for signatures of different lengths in jaccardSimilarity", () => {
    expect(() => detector["jaccardSimilarity"]([1, 2, 3], [1, 2])).toThrow("Signatures must be of the same length");
  });

  it("should check similarity", async () => {
    const text = "hello world";
    const signature = detector["minHashSignature"](detector["shingles"](text));
    const validCandidate = JSON.stringify({ articleId: "article1", signature });
    redisClient.sMembers.mockResolvedValueOnce([validCandidate]);
    const results = await detector.checkSimilarity("bucket", text);
    expect(results.length).toBe(1);
    expect(results[0].articleId).toBe("article1");
    expect(results[0].similarity).toBe(1);
  });

  it("should add article and store signature", async () => {
    const text = "hello world";
    await detector.addArticle("bucket", "article1", text);
    expect(redisClient.sAdd).toHaveBeenCalledTimes(20); // numBands
  });
});
