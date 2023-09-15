import { getPngInfo, getOriginalKeyNames, PngInfoObject, OriginalKeyPngInfoObject, LoraHash } from '../src/index';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('getPngInfo', () => {
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

    it('should correctly parse a json string (format option: json)', async () => {
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

describe('getOriginalKeyNames', () => {
    it('should correctly map keys of the PngInfoObject to original keys', () => {
        const loraHashes: Array<LoraHash> = [{ test1: "aaaaaaaaaaaa" }, { test2: "aaaaaaaaaaaa" }];
        const pngInfo: PngInfoObject = {
            steps: 30,
            sampler: "test",
            cfgScale: 7,
            seed: 3762574169,
            size: "512x512",
            modelHash: "aaaaaaaaaa",
            model: "testModel",
            loraHashes,
            version: "v1.5.0",
            prompt: ["prompt1", "prompt2", "<lora:test1:1.35>", "<lora:test2:1.7>"],
            negativePrompt: ["negativePrompt1", "negativePrompt2"],
            controlNetList: [
                {
                  key: 'ControlNet 0',
                  module: 'controlnet_module',
                  model: 'controlnet_model [abcdef12]',
                  weight: '1',
                  resizeMode: 'Crop and Resize',
                  lowVram: 'False',
                  processorRes: 512,
                  guidanceStart: '0',
                  guidanceEnd: '1',
                  pixelPerfect: false,
                  controlMode: 'Balanced'
                },
                {
                  key: 'ControlNet 1',
                  module: 'controlnet_module',
                  model: 'controlnet_model [abcdef12]',
                  weight: '1',
                  resizeMode: 'Crop and Resize',
                  lowVram: 'False',
                  processorRes: 512,
                  guidanceStart: '0',
                  guidanceEnd: '1',
                  pixelPerfect: true,
                  controlMode: 'Balanced'
                },
              ]
        };

        const expected: OriginalKeyPngInfoObject = {
            "Steps": 30,
            "Sampler": "test",
            "CFG scale": 7,
            "Seed": 3762574169,
            "Size": "512x512",
            "Model hash": "aaaaaaaaaa",
            "Model": "testModel",
            "Lora hashes": [{ test1: "aaaaaaaaaaaa" }, { test2: "aaaaaaaaaaaa" }],
            "Version": "v1.5.0",
            "Prompt": ["prompt1", "prompt2", "<lora:test1:1.35>", "<lora:test2:1.7>"],
            "Negative prompt": ["negativePrompt1", "negativePrompt2"],
            "ControlNet 0": {
                "Module": "controlnet_module",
                "Model": "controlnet_model [abcdef12]",
                "Weight": "1",
                "Resize Mode": "Crop and Resize",
                "Low Vram": "False",
                "Processor Res": 512,
                "Guidance Start": "0",
                "Guidance End": "1",
                "Pixel Perfect": false,
                "Control Mode": "Balanced"
            },
            "ControlNet 1": {
                "Module": "controlnet_module",
                "Model": "controlnet_model [abcdef12]",
                "Weight": "1",
                "Resize Mode": "Crop and Resize",
                "Low Vram": "False",
                "Processor Res": 512,
                "Guidance Start": "0",
                "Guidance End": "1",
                "Pixel Perfect": true,
                "Control Mode": "Balanced"
            }
        };

        expect(getOriginalKeyNames(pngInfo)).toEqual(expected);
    });

    it('should not change keys that do not exist in keyMapping', () => {
        const loraHashes: Array<LoraHash> = [{ test1: "aaaaaaaaaaaa" }, { test2: "aaaaaaaaaaaa" }];
        const pngInfo: PngInfoObject & { extraKey: string } = {
            steps: 30,
            sampler: "test",
            cfgScale: 7,
            seed: 3762574169,
            size: "512x512",
            modelHash: "aaaaaaaaaa",
            model: "testModel",
            loraHashes,
            version: "v1.5.0",
            prompt: ["prompt1", "prompt2", "<lora:test1:1.35>", "<lora:test2:1.7>"],
            negativePrompt: ["negativePrompt1", "negativePrompt2"],
            extraKey: "extraValue"
        };

        const expected: OriginalKeyPngInfoObject & { extraKey: string } = {
            "Steps": 30,
            "Sampler": "test",
            "CFG scale": 7,
            "Seed": 3762574169,
            "Size": "512x512",
            "Model hash": "aaaaaaaaaa",
            "Model": "testModel",
            "Lora hashes": [{ test1: "aaaaaaaaaaaa" }, { test2: "aaaaaaaaaaaa" }],
            "Version": "v1.5.0",
            "Prompt": ["prompt1", "prompt2", "<lora:test1:1.35>", "<lora:test2:1.7>"],
            "Negative prompt": ["negativePrompt1", "negativePrompt2"],
            extraKey: "extraValue"
        };

        expect(getOriginalKeyNames(pngInfo)).toEqual(expected);
    });
});
