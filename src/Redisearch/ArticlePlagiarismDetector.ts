import { createClient, RedisClientType } from "redis";
import { createHash } from "crypto";

/**
 * 文章抄袭检测类
 */
export class ArticlePlagiarismDetector {
  private redisClient: RedisClientType;
  private k: number;
  private numHashes: number;
  private numBands: number;
  private rowsPerBand: number;

  constructor(
    redisUrl: string,
    k: number,
    numHashes: number,
    numBands: number
  ) {
    this.redisClient = createClient({ url: redisUrl });
    this.k = k;
    this.numHashes = numHashes;
    this.numBands = numBands;
    this.rowsPerBand = numHashes / numBands;
  }

  async connect() {
    await this.redisClient.connect();
  }

  async disconnect() {
    await this.redisClient.quit();
  }

  /**
   * 将文本拆分为shingles
   * @param text 输入文本
   * @returns shingle数组
   */
  private shingles(text: string): string[] {
    const shinglesSet = new Set<string>();
    for (let i = 0; i <= text.length - this.k; i++) {
      shinglesSet.add(text.slice(i, i + this.k));
    }
    return Array.from(shinglesSet);
  }

  /**
   * 计算shingle的哈希值
   * @param shingle 输入shingle
   * @returns 哈希值数组
   */
  private hashShingle(shingle: string): number[] {
    const hashes: number[] = [];
    for (let i = 0; i < this.numHashes; i++) {
      const hash = createHash("sha256")
        .update(shingle + i)
        .digest("hex");
      hashes.push(parseInt(hash, 16));
    }
    return hashes;
  }

  /**
   * 计算shingle集合的MinHash签名
   * @param shingles shingle数组
   * @returns MinHash签名数组
   */
  private minHashSignature(shingles: string[]): number[] {
    const signature = Array(this.numHashes).fill(Infinity);
    for (const shingle of shingles) {
      const hashes = this.hashShingle(shingle);
      for (let i = 0; i < this.numHashes; i++) {
        if (hashes[i] < signature[i]) {
          signature[i] = hashes[i];
        }
      }
    }
    return signature;
  }

  /**
   * 使用LSH存储签名
   * @param bucketPrefix 桶的前缀
   * @param articleId 文章ID
   * @param signature MinHash签名
   */
  private async storeSignatureLSH(
    bucketPrefix: string,
    articleId: string,
    signature: number[]
  ): Promise<void> {
    if (signature.length !== this.numHashes) {
      throw new Error(
        `Invalid signature length: expected ${this.numHashes}, got ${signature.length}`
      );
    }
    for (let i = 0; i < this.numBands; i++) {
      const band = signature.slice(
        i * this.rowsPerBand,
        (i + 1) * this.rowsPerBand
      );
      const bandKey = `${bucketPrefix}:${i}:${band.join(",")}`;
      await this.redisClient.sAdd(
        bandKey,
        JSON.stringify({ articleId, signature })
      );
    }
  }

  /**
   * 使用LSH检索候选签名
   * @param bucketPrefix 桶的前缀
   * @param signature MinHash签名
   * @returns 候选签名数组
   */
  private async retrieveCandidatesLSH(
    bucketPrefix: string,
    signature: number[]
  ): Promise<{ articleId: string; signature: number[] }[]> {
    const candidates = new Set<string>();
    for (let i = 0; i < this.numBands; i++) {
      const band = signature.slice(
        i * this.rowsPerBand,
        (i + 1) * this.rowsPerBand
      );
      const bandKey = `${bucketPrefix}:${i}:${band.join(",")}`;
      const bandCandidates = await this.redisClient.sMembers(bandKey);
      bandCandidates.forEach((candidate: string) => candidates.add(candidate));
    }
    const result = Array.from(candidates)
      .map((candidate) => {
        try {
          const parsedCandidate = JSON.parse(candidate);
          if (
            !parsedCandidate.articleId ||
            !Array.isArray(parsedCandidate.signature) ||
            parsedCandidate.signature.length !== this.numHashes
          ) {
            return null;
          }
          return parsedCandidate;
        } catch (e) {
          console.error("Failed to parse candidate:", candidate, e);
          return null;
        }
      })
      .filter((candidate) => candidate !== null);

    return result;
  }

  /**
   * 计算两个签名的Jaccard相似度
   * @param signature1 签名1
   * @param signature2 签名2
   * @returns Jaccard相似度
   */
  private jaccardSimilarity(
    signature1: number[],
    signature2: number[]
  ): number {
    if (!signature1 || !signature2) {
      throw new Error("Signatures cannot be null or undefined");
    }
    if (signature1.length !== signature2.length) {
      throw new Error("Signatures must be of the same length");
    }

    let intersection = 0;
    for (let i = 0; i < signature1.length; i++) {
      if (signature1[i] === signature2[i]) {
        intersection++;
      }
    }
    return intersection / signature1.length;
  }

  /**
   * 检查文章相似度
   * @param bucketPrefix 桶的前缀
   * @param text 文章文本
   * @returns 与缓存中文章的相似度和对应文章ID
   */
  async checkSimilarity(
    bucketPrefix: string,
    text: string
  ): Promise<{ articleId: string; similarity: number }[]> {
    const shingles = this.shingles(text);
    const signature = this.minHashSignature(shingles);

    // 检索候选签名
    const candidates = await this.retrieveCandidatesLSH(
      bucketPrefix,
      signature
    );

    // 计算相似度
    return candidates.map((candidate) => {
      if (
        !candidate.signature ||
        candidate.signature.length !== this.numHashes
      ) {
        console.error("Invalid candidate signature:", candidate);
        return { articleId: candidate.articleId, similarity: 0 };
      }
      return {
        articleId: candidate.articleId,
        similarity: this.jaccardSimilarity(signature, candidate.signature),
      };
    });
  }

  /**
   * 添加文章并存储签名
   * @param bucketPrefix 桶的前缀
   * @param articleId 文章ID
   * @param text 文章文本
   */
  async addArticle(bucketPrefix: string, articleId: string, text: string) {
    const shingles = this.shingles(text);
    const signature = this.minHashSignature(shingles);

    // 存储签名
    await this.storeSignatureLSH(bucketPrefix, articleId, signature);
  }
}
