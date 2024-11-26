interface QA {
    id: string;
    text: string;
}
interface SimilarQA {
    id: string;
    text: string;
    similarity: number;
}
declare class QuestionSearch {
    private redisClient;
    private numBands;
    private rowsPerBand;
    private numHashes;
    constructor(numBands: number, rowsPerBand: number, url?: string);
    private shingles;
    private minHashSignature;
    private hashFunction;
    private jaccardSimilarity;
    storeSignatureLSH(bucketPrefix: string, qa: QA, signature: number[]): Promise<void>;
    private retrieveCandidatesLSH;
    checkSimilarity(bucketPrefix: string, question: string): Promise<SimilarQA[]>;
    createIndex(bucketPrefix: string, qa: QA): Promise<void>;
    deleteIndex(bucketPrefix: string): Promise<void>;
    rebuildIndex(bucketPrefix: string, qa: QA): Promise<void>;
}
export { QuestionSearch };
