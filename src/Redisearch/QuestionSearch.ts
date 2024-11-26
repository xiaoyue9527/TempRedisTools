import { createClient, RedisClientType } from 'redis';

interface QA {
    id: string;
    text: string;
}

interface SimilarQA {
    id: string;
    text: string;
    similarity: number;
}

class QuestionSearch {
    private redisClient: RedisClientType;
    private numBands: number;
    private rowsPerBand: number;
    private numHashes: number;

    constructor(numBands: number, rowsPerBand: number) {
        this.numBands = numBands;
        this.rowsPerBand = rowsPerBand;
        this.numHashes = numBands * rowsPerBand;
        this.redisClient = createClient();

        this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
        this.redisClient.connect().catch(console.error);
    }

    private shingles(text: string): string[] {
        const shingles = [];
        for (let i = 0; i < text.length - 2; i++) {
            shingles.push(text.substring(i, i + 3));
        }
        return shingles;
    }

    private minHashSignature(shingles: string[]): number[] {
        const signature = Array(this.numHashes).fill(Infinity);
        shingles.forEach((shingle) => {
            for (let i = 0; i < this.numHashes; i++) {
                const hashValue = this.hashFunction(shingle, i);
                if (hashValue < signature[i]) {
                    signature[i] = hashValue;
                }
            }
        });
        return signature;
    }

    private hashFunction(shingle: string, seed: number): number {
        let hash = seed;
        for (let i = 0; i < shingle.length; i++) {
            hash = (hash * 31 + shingle.charCodeAt(i)) >>> 0;
        }
        return hash;
    }

    private jaccardSimilarity(sig1: number[], sig2: number[]): number {
        let intersection = 0;
        for (let i = 0; i < sig1.length; i++) {
            if (sig1[i] === sig2[i]) {
                intersection++;
            }
        }
        return intersection / sig1.length;
    }

    public async storeSignatureLSH(bucketPrefix: string, qa: QA, signature: number[]): Promise<void> {
        if (signature.length !== this.numHashes) {
            throw new Error(`签名长度无效：预期 ${this.numHashes}，但得到 ${signature.length}`);
        }

        const pipeline = this.redisClient.multi();
        for (let i = 0; i < this.numBands; i++) {
            const band = signature.slice(i * this.rowsPerBand, (i + 1) * this.rowsPerBand);
            const bandKey = `${bucketPrefix}:${i}:${band.join(",")}`;
            pipeline.sAdd(bandKey, JSON.stringify({ id: qa.id, text: qa.text, signature }));
        }

        await pipeline.exec();
        console.log(`已存储签名到 LSH 桶：${bucketPrefix}`);
    }

    private async retrieveCandidatesLSH(bucketPrefix: string, signature: number[]): Promise<{ id: string; text: string; signature: number[] }[]> {
        const candidates = new Set<string>();
        const pipeline = this.redisClient.multi();

        for (let i = 0; i < this.numBands; i++) {
            const band = signature.slice(i * this.rowsPerBand, (i + 1) * this.rowsPerBand);
            const bandKey = `${bucketPrefix}:${i}:${band.join(",")}`;
            pipeline.sMembers(bandKey);
        }

        const results = await pipeline.exec();
        results.forEach((result: any) => {
            if (result[1]) {
                result[1].forEach((candidate: string) => candidates.add(candidate));
            }
        });

        const parsedCandidates = Array.from(candidates).map((candidate) => {
            try {
                const parsedCandidate = JSON.parse(candidate);
                if (!parsedCandidate.id || !parsedCandidate.text || !Array.isArray(parsedCandidate.signature) || parsedCandidate.signature.length !== this.numHashes) {
                    return null;
                }
                return parsedCandidate;
            } catch (e) {
                console.error("解析候选项失败：", candidate, e);
                return null;
            }
        }).filter((candidate) => candidate !== null);

        return parsedCandidates;
    }

    public async checkSimilarity(bucketPrefix: string, question: string): Promise<SimilarQA[]> {
        const shingles = this.shingles(question);
        const signature = this.minHashSignature(shingles);

        const candidates = await this.retrieveCandidatesLSH(bucketPrefix, signature);

        return candidates.map((candidate) => {
            if (!candidate.signature || candidate.signature.length !== this.numHashes) {
                console.error("候选项签名无效：", candidate);
                return { text: candidate.text, similarity: 0, id: candidate.id };
            }
            return {
                text: candidate.text,
                similarity: this.jaccardSimilarity(signature, candidate.signature),
                id: candidate.id,
            };
        }).sort((a, b) => b.similarity - a.similarity);
    }
}

export {
    QuestionSearch
}