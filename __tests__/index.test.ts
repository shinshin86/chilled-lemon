import { getPngInfo } from '../src/index';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

describe('getPngInfo(JSON) function', () => {
    it('should correctly parse a json string', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const options = {};
        const result = await getPngInfo(buf, options);
        const parsedJson = JSON.parse(result);

        expect(parsedJson).toHaveProperty('Sampler');

        expect(parsedJson).toHaveProperty('CFG scale');
        expect(isNaN(parseFloat(parsedJson['CFG scale']))).toBe(false)

        expect(parsedJson).toHaveProperty('Seed');
        expect(isNaN(parseFloat(parsedJson['Seed']))).toBe(false)

        expect(parsedJson).toHaveProperty('Size');
        expect(parsedJson.Size).toMatch(/^\d+x\d+$/);

        expect(parsedJson).toHaveProperty('Model hash');

        expect(parsedJson).toHaveProperty('Model');

        // Check to Lora hashes
        const loraHashes = parsedJson["Lora hashes"];
        expect(Array.isArray(loraHashes)).toBe(true);
        loraHashes.forEach(hash => {
            expect(typeof hash).toBe("object");

            // Expect each object has exactly one key-value pair
            const keys = Object.keys(hash);
            expect(keys.length).toBe(1);
            const values = Object.values(hash);
            expect(values.length).toBe(1);
        });

        expect(parsedJson).toHaveProperty('Version');

        // Check to prompt
        const prompt = parsedJson["Prompt"];
        expect(Array.isArray(prompt)).toBe(true);
        prompt.forEach(word => {
            expect(typeof word).toBe("string");
        });

        // Check to Negative prompt
        const negativePrompt = parsedJson["Negative prompt"];
        expect(Array.isArray(negativePrompt)).toBe(true);
        prompt.forEach(word => {
            expect(typeof word).toBe("string");
        });
    })
});