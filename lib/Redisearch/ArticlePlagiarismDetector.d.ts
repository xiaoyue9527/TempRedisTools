/**
 * 文章抄袭检测类
 */
export declare class ArticlePlagiarismDetector {
    private redisClient;
    private k;
    private numHashes;
    private numBands;
    private rowsPerBand;
    constructor(redisUrl: string, k: number, numHashes: number, numBands: number);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * 将文本拆分为shingles
     * @param text 输入文本
     * @returns shingle数组
     */
    private shingles;
    /**
     * 计算shingle的哈希值
     * @param shingle 输入shingle
     * @returns 哈希值数组
     */
    private hashShingle;
    /**
     * 计算shingle集合的MinHash签名
     * @param shingles shingle数组
     * @returns MinHash签名数组
     */
    private minHashSignature;
    /**
     * 使用LSH存储签名
     * @param bucketPrefix 桶的前缀
     * @param articleId 文章ID
     * @param signature MinHash签名
     */
    private storeSignatureLSH;
    /**
     * 使用LSH检索候选签名
     * @param bucketPrefix 桶的前缀
     * @param signature MinHash签名
     * @returns 候选签名数组
     */
    private retrieveCandidatesLSH;
    /**
     * 计算两个签名的Jaccard相似度
     * @param signature1 签名1
     * @param signature2 签名2
     * @returns Jaccard相似度
     */
    private jaccardSimilarity;
    /**
     * 检查文章相似度
     * @param bucketPrefix 桶的前缀
     * @param text 文章文本
     * @returns 与缓存中文章的相似度和对应文章ID
     */
    checkSimilarity(bucketPrefix: string, text: string): Promise<{
        articleId: string;
        similarity: number;
    }[]>;
    /**
     * 添加文章并存储签名
     * @param bucketPrefix 桶的前缀
     * @param articleId 文章ID
     * @param text 文章文本
     */
    addArticle(bucketPrefix: string, articleId: string, text: string): Promise<void>;
}
