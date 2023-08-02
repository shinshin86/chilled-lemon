import { getPngInfo } from '../src/index';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

describe('getPngInfo(JSON) function', () => {
    it('should correctly parse a json string', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const result = await getPngInfo(buf);
        expect(typeof result).toBe('object');

        if (typeof result === 'object') {
            expect(result).toHaveProperty('steps');
            expect(isNaN(Number(result.steps))).toBe(false)

            expect(result).toHaveProperty('sampler');

            expect(result).toHaveProperty('cfgScale');
            expect(isNaN(Number(result.cfgScale))).toBe(false)

            expect(result).toHaveProperty('seed');
            expect(isNaN(Number(result.seed))).toBe(false)

            expect(result).toHaveProperty('size');
            expect(result.size).toMatch(/^\d+x\d+$/);

            expect(result).toHaveProperty('modelHash');

            expect(result).toHaveProperty('model');

            // Check to Lora hashes
            const loraHashes = result.loraHashes;
            expect(Array.isArray(loraHashes)).toBe(true);
            loraHashes.forEach(hash => {
                expect(typeof hash).toBe("object");

                // Expect each object has exactly one key-value pair
                const keys = Object.keys(hash);
                expect(keys.length).toBe(1);
                const values = Object.values(hash);
                expect(values.length).toBe(1);
            });

            expect(result).toHaveProperty('version');

            // Check to prompt
            expect(Array.isArray(result.prompt)).toBe(true);
            const prompt = result.prompt || [];
            prompt.forEach(word => {
                expect(typeof word).toBe("string");
            });

            // Check to Negative prompt
            expect(Array.isArray(result.negativePrompt)).toBe(true);
            const negativePrompt = result.negativePrompt || []
            negativePrompt.forEach(word => {
                expect(typeof word).toBe("string");
            });
        }
    })

    it('should correctly parse a json string', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const result = await getPngInfo(buf, { format: 'json' });
        expect(typeof result).toBe('object');

        if (typeof result === 'object') {
            expect(result).toHaveProperty('steps');
            expect(isNaN(Number(result.steps))).toBe(false)

            expect(result).toHaveProperty('sampler');

            expect(result).toHaveProperty('cfgScale');
            expect(isNaN(Number(result.cfgScale))).toBe(false)

            expect(result).toHaveProperty('seed');
            expect(isNaN(Number(result.seed))).toBe(false)

            expect(result).toHaveProperty('size');
            expect(result.size).toMatch(/^\d+x\d+$/);

            expect(result).toHaveProperty('modelHash');

            expect(result).toHaveProperty('model');

            // Check to Lora hashes
            const loraHashes = result.loraHashes;
            expect(Array.isArray(loraHashes)).toBe(true);
            loraHashes.forEach(hash => {
                expect(typeof hash).toBe("object");

                // Expect each object has exactly one key-value pair
                const keys = Object.keys(hash);
                expect(keys.length).toBe(1);
                const values = Object.values(hash);
                expect(values.length).toBe(1);
            });

            expect(result).toHaveProperty('version');

            // Check to prompt
            expect(Array.isArray(result.prompt)).toBe(true);
            const prompt = result.prompt || [];
            prompt.forEach(word => {
                expect(typeof word).toBe("string");
            });

            // Check to Negative prompt
            expect(Array.isArray(result.negativePrompt)).toBe(true);
            const negativePrompt = result.negativePrompt || []
            negativePrompt.forEach(word => {
                expect(typeof word).toBe("string");
            });
        }
    })

    it('should correctly parse to a plain text (format option: text)', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const result = await getPngInfo(buf, { format: 'text' });
        expect(typeof result).toBe("string");
    })
});