import { QuestionSearch } from "../src/Redisearch/QuestionSearch";
import { RedisClientType } from "redis";

// Mock redis
jest.mock("redis", () => {
    const mRedisClient = {
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined),
        quit: jest.fn(),
        sAdd: jest.fn(),
        sMembers: jest.fn().mockResolvedValue([]),
        multi: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
    };
    return {
        createClient: jest.fn(() => mRedisClient),
    };
});

describe("QuestionSearch", () => {
    let questionSearch: QuestionSearch;
    let redisClient: jest.Mocked<RedisClientType> & { exec: jest.Mock };

    beforeEach(() => {
        questionSearch = new QuestionSearch(5, 20); // Adjust the parameters as needed
        redisClient = (questionSearch as any).redisClient as jest.Mocked<RedisClientType> & { exec: jest.Mock };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should connect to redis", async () => {
        await (redisClient as any).connect();
        expect(redisClient.connect).toHaveBeenCalled();
    });

    it("should create shingles", () => {
        const text = "hello world";
        const shingles = (questionSearch as any).shingles(text);
        expect(shingles).toEqual(["hel", "ell", "llo", "lo ", "o w", " wo", "wor", "orl", "rld"]);
    });

    it("should create min hash signature", () => {
        const shingles = ["hel", "ell", "llo"];
        const signature = (questionSearch as any).minHashSignature(shingles);
        expect(signature.length).toBe(100); // numBands * rowsPerBand
    });

    it("should store signature in LSH", async () => {
        const signature = Array(100).fill(0);
        const qa = { id: "qa1", text: "What is Redis?" };
        await questionSearch.storeSignatureLSH("bucket", qa, signature);
        expect(redisClient.multi).toHaveBeenCalled();
        expect(redisClient.sAdd).toHaveBeenCalledTimes(5); // numBands
        expect(redisClient.exec).toHaveBeenCalled();
    });

    it("should throw error for invalid signature length", async () => {
        const invalidSignature = Array(99).fill(0);
        const qa = { id: "qa1", text: "What is Redis?" };
        await expect(questionSearch.storeSignatureLSH("bucket", qa, invalidSignature))
            .rejects
            .toThrow("签名长度无效：预期 100，但得到 99");
    });

    it("should retrieve candidates from LSH", async () => {
        const signature = Array(100).fill(0);
        const validCandidate = JSON.stringify({ id: "qa1", text: "What is Redis?", signature: Array(100).fill(0) });
        redisClient.exec.mockResolvedValueOnce([[null, [validCandidate]]]);
        const candidates = await (questionSearch as any).retrieveCandidatesLSH("bucket", signature);
        expect(candidates.length).toBe(1);
        expect(candidates[0].id).toBe("qa1");
    });

    it("should handle invalid candidate signature", async () => {
        const signature = Array(100).fill(0);
        const invalidCandidate = JSON.stringify({ id: "qa1", text: "What is Redis?", signature: Array(99).fill(0) });
        redisClient.exec.mockResolvedValueOnce([[null, [invalidCandidate]]]);
        const candidates = await (questionSearch as any).retrieveCandidatesLSH("bucket", signature);
        expect(candidates.length).toBe(0);
    });

    it("should handle parsing error in retrieveCandidatesLSH", async () => {
        const signature = Array(100).fill(0);
        const invalidJSON = '{"id": "qa1", "text": "What is Redis?", "signature": [0,0,0';
        redisClient.exec.mockResolvedValueOnce([[null, [invalidJSON]]]);
        const candidates = await (questionSearch as any).retrieveCandidatesLSH("bucket", signature);
        expect(candidates.length).toBe(0);
    });

    it("should calculate Jaccard similarity", () => {
        const signature1 = [1, 2, 3, 4, 5];
        const signature2 = [1, 2, 3, 4, 6];
        const similarity = (questionSearch as any).jaccardSimilarity(signature1, signature2);
        expect(similarity).toBe(0.8);
    });

    it("should check similarity", async () => {
        const question = "What is Redis?";
        const signature = (questionSearch as any).minHashSignature((questionSearch as any).shingles(question));
        const validCandidate = JSON.stringify({ id: "qa1", text: "What is Redis?", signature });
        redisClient.exec.mockResolvedValueOnce([[null, [validCandidate]]]);
        const results = await questionSearch.checkSimilarity("bucket", question);
        expect(results.length).toBe(1);
        expect(results[0].id).toBe("qa1");
        expect(results[0].similarity).toBe(1);
    });
});
