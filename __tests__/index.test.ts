import { getPngInfo } from '../src/index';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

describe('getPngInfo(JSON) function', () => {
    it('should correctly parse a json string', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const result = await getPngInfo(buf);
        const parsedJson = JSON.parse(result);

        expect(parsedJson).toHaveProperty('sampler');

        expect(parsedJson).toHaveProperty('cfgScale');
        expect(isNaN(parseFloat(parsedJson.cfgScale))).toBe(false)

        expect(parsedJson).toHaveProperty('seed');
        expect(isNaN(parseFloat(parsedJson.seed))).toBe(false)

        expect(parsedJson).toHaveProperty('size');
        expect(parsedJson.size).toMatch(/^\d+x\d+$/);

        expect(parsedJson).toHaveProperty('modelHash');

        expect(parsedJson).toHaveProperty('model');

        // Check to Lora hashes
        const loraHashes = parsedJson.loraHashes;
        expect(Array.isArray(loraHashes)).toBe(true);
        loraHashes.forEach(hash => {
            expect(typeof hash).toBe("object");

            // Expect each object has exactly one key-value pair
            const keys = Object.keys(hash);
            expect(keys.length).toBe(1);
            const values = Object.values(hash);
            expect(values.length).toBe(1);
        });

        expect(parsedJson).toHaveProperty('version');

        // Check to prompt
        const prompt = parsedJson.prompt;
        expect(Array.isArray(prompt)).toBe(true);
        prompt.forEach(word => {
            expect(typeof word).toBe("string");
        });

        // Check to Negative prompt
        const negativePrompt = parsedJson.negativePrompt;
        expect(Array.isArray(negativePrompt)).toBe(true);
        prompt.forEach(word => {
            expect(typeof word).toBe("string");
        });
    })

    it('should correctly parse a json string (format option: json)', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const result = await getPngInfo(buf, { format: 'json' });
        const parsedJson = JSON.parse(result);

        expect(parsedJson).toHaveProperty('sampler');

        expect(parsedJson).toHaveProperty('cfgScale');
        expect(isNaN(parseFloat(parsedJson.cfgScale))).toBe(false)

        expect(parsedJson).toHaveProperty('seed');
        expect(isNaN(parseFloat(parsedJson.seed))).toBe(false)

        expect(parsedJson).toHaveProperty('size');
        expect(parsedJson.size).toMatch(/^\d+x\d+$/);

        expect(parsedJson).toHaveProperty('modelHash');

        expect(parsedJson).toHaveProperty('model');

        // Check to Lora hashes
        const loraHashes = parsedJson.loraHashes;
        expect(Array.isArray(loraHashes)).toBe(true);
        loraHashes.forEach(hash => {
            expect(typeof hash).toBe("object");

            // Expect each object has exactly one key-value pair
            const keys = Object.keys(hash);
            expect(keys.length).toBe(1);
            const values = Object.values(hash);
            expect(values.length).toBe(1);
        });

        expect(parsedJson).toHaveProperty('version');

        // Check to prompt
        const prompt = parsedJson.prompt;
        expect(Array.isArray(prompt)).toBe(true);
        prompt.forEach(word => {
            expect(typeof word).toBe("string");
        });

        // Check to Negative prompt
        const negativePrompt = parsedJson.negativePrompt;
        expect(Array.isArray(negativePrompt)).toBe(true);
        prompt.forEach(word => {
            expect(typeof word).toBe("string");
        });
    })

    it('should correctly parse to a plain text (format option: text)', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const result = await getPngInfo(buf, { format: 'text' });
        expect(typeof result).toBe("string");
    })
});