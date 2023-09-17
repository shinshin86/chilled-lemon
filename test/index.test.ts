import { getPngInfo, getOriginalKeyNames, PngInfoObject, OriginalKeyPngInfoObject, LoraHash, getInfotext, getInfotextJson, convertInfotextToJson, convertJsonToInfotext } from '../src/index';
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
        const lines = result.split('\n');
        expect(lines.length).toBe(3);
    })
});

describe('getInfotext', () => {
    it('should correctly parse to a infotext', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const infotext = await getInfotext(buf);
        expect(typeof infotext).toBe("string");
        const lines = infotext.split('\n');
        expect(lines.length).toBe(3);
    })
});

describe('getInfotextJson', () => {
    it('should correctly parse a json string', async () => {
        const buf = await readFile(path.join(__dirname, "test-image.png"));
        const result = await getInfotextJson(buf);
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
            loraHashes?.forEach(hash => {
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

describe('convertInfotextToJson', () => {
    it('should correctly convert infotext to json', () => {
        const infotext = `test, prompt
Negative prompt: test, negative, prompt
Steps: 20, Sampler: DPM++ 2M Karras, CFG scale: 7, Seed: 1234567890, Size: 512x512, Model hash: 6ce0161689, Model: v1-5-pruned-emaonly, Version: v1.6.0`;
        const json = convertInfotextToJson(infotext);

        expect(Array.isArray(json.prompt)).toBe(true);
        expect(json.prompt.length).toBe(2);
        expect(json.prompt[0]).toBe('test');
        expect(json.prompt[1]).toBe('prompt');

        expect(Array.isArray(json.negativePrompt)).toBe(true);
        expect(json.negativePrompt.length).toBe(3);
        expect(json.negativePrompt[0]).toBe('test');
        expect(json.negativePrompt[1]).toBe('negative');
        expect(json.negativePrompt[2]).toBe('prompt');

        expect(Number(json.steps)).toBe(20);
        expect(json.sampler).toBe("DPM++ 2M Karras");
        expect(Number(json.cfgScale)).toBe(7);
        expect(Number(json.seed)).toBe(1234567890);
        expect(json.size).toBe("512x512");
        expect(json.modelHash).toBe('6ce0161689');
        expect(json.model).toBe('v1-5-pruned-emaonly');
        expect(json.version).toBe('v1.6.0');
    })
})

describe('convertJsonToInfotext', () => {
    it('should correctly convert json to infotext', () => {
        const json: PngInfoObject = {
            prompt: ['test', 'prompt'],
            negativePrompt: ["test", "negative", "prompt"],
            steps: 20,
            sampler: 'DPM++ 2M Karras',
            cfgScale: 7,
            seed: 1234567890,
            size: "512x512",
            modelHash: "6ce0161689",
            model: "v1-5-pruned-emaonly",
            version: "v1.6.0",
        }

        const infotext = convertJsonToInfotext(json);
        expect(typeof infotext).toBe("string");
        const lines = infotext.split('\n');
        expect(lines.length).toBe(3);


        const expectedInfotext = `test, prompt
Negative prompt: test, negative, prompt
Steps: 20, Sampler: DPM++ 2M Karras, CFG scale: 7, Seed: 1234567890, Size: 512x512, Model hash: 6ce0161689, Model: v1-5-pruned-emaonly, Version: v1.6.0`;
        expect(infotext).toBe(expectedInfotext);
    })
})