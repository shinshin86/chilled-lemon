type FormatOptions = 'json' | 'text';

interface Options {
    format?: FormatOptions;
}

const keyMapping = {
    "Steps": "steps",
    "Sampler": "sampler",
    "CFG scale": "cfgScale",
    "Seed": "seed",
    "Size": "size",
    "Model hash": "modelHash",
    "Model": "model",
    "Lora hashes": "loraHashes",
    "Version": "version",
    "Prompt": "prompt",
    "Negative prompt": "negativePrompt"
}

type LoraHash = {
    [key: string]: string
}

export type PngInfoObject = {
    steps: number,
    sampler: string,
    cfgScale: number,
    seed: number,
    size: string,
    modelHash: string,
    model: string,
    loraHashes: Array<LoraHash>,
    version: string,
    prompt: Array<string>,
    negativePrompt: Array<string>
}

export type OriginalKeyPngInfoObject = {
    "Steps": number,
    "Sampler": string,
    "CFG scale": number,
    "Seed": number,
    "Size": string,
    "Model hash": string,
    "Model": string,
    "Lora hashes": Array<LoraHash>,
    "Version": string,
    "Prompt": Array<string>,
    "Negative prompt": Array<string>,
}

export async function getPngInfo(arrayBuffer: ArrayBuffer, options?: Options): Promise<PngInfoObject | string> {
    const buffer = new Uint8Array(arrayBuffer);
    const fileSignature = buffer.slice(0, 8);

    const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const crcSize = 4;
    let infoString = "";

    if (!fileSignature.every((value, index) => value === pngSignature[index])) {
        return "";
    }

    let position = 8;
    while (position < buffer.length) {
        const view = new DataView(buffer.buffer).getUint32(position);
        position += 4;

        const chunkType = new TextDecoder().decode(buffer.slice(position, position + 4));
        position += 4;

        if (chunkType === 'tEXt' || chunkType === 'iTXt') {
            const slicedView = buffer.slice(position, position + view);
            position += view;

            // Checks if the first 10 bytes of the chunk is the string 'parameters
            if (new TextDecoder().decode(slicedView.slice(0, 10)) === 'parameters') {
                let data = slicedView.slice(10);

                // Delete leading null bytes
                while (data.length > 0 && data[0] === 0) {
                    data = data.slice(1);
                }

                // Decode data
                infoString = chunkType === 'tEXt' ? new TextDecoder("iso-8859-1").decode(data) : new TextDecoder("utf-8").decode(data);
                break;
            }
        } else {
            position += view;
        }

        position += crcSize;
    }


    const isFormatJson = !options || !options.format || options.format === 'json';
    if (isFormatJson) {
        return getPngInfoJson(infoString);
    } else if (options.format === 'text') {
        return infoString;
    }
}

async function getPngInfoJson(infoString: string): Promise<PngInfoObject> {
    const lines = infoString.split("\n");
    let phase = 0;
    let prompt = "";
    let negativePrompt = "";
    const data: Partial<PngInfoObject> = {};

    const NEGATIVE_PROMPT_PREFIX_LENGTH = 17;
    const NEGATIVE_PROMPT_PREFIX_STRING = "Negative prompt: ";

    for (const line of lines) {
        const re = /([A-Z][a-zA-Z0-9 ]*: [^,]+)(, )?/g;
        if (phase === 0) {
            if (line.startsWith(NEGATIVE_PROMPT_PREFIX_STRING)) {
                negativePrompt = line.slice(NEGATIVE_PROMPT_PREFIX_LENGTH);
                phase = 1;
                continue;
            }

            const m = re.exec(line);
            if (m) {
                phase = 2;
            } else {
                prompt += "\n" + line;
                continue;
            }
        }

        if (phase === 1) {
            const m = re.exec(line);
            if (!m) {
                negativePrompt += "\n" + line;
                continue;
            }
            phase = 2;
        }

        if (phase === 2) {
            let re = /([a-zA-Z\s]+):\s*("[^"]+"|[^,]+)/g;
            let match;

            while ((match = re.exec(line)) !== null) {
                let key = match[1].trim();
                let value = match[2].trim();
                if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.slice(1, -1);
                }
                if (key === 'Lora hashes') {
                    const loraHashes = [];
                    const loraHashesParts = value.split(', ');
                    for (const part of loraHashesParts) {
                        const [loraKey, loraValue] = part.split(': ');
                        loraHashes.push({ [loraKey]: loraValue });
                    }
                    data[keyMapping[key]] = loraHashes;
                } else {
                    data[keyMapping[key]] = value;
                }
            }
        }
    }

    data[keyMapping["Prompt"]] = prompt.trim().split(',').map(item => item.trim()).filter(item => item);
    data[keyMapping["Negative prompt"]] = negativePrompt.trim().split(',').map(item => item.trim()).filter(item => item);

    return data as PngInfoObject;
}

export function getOriginalKeyNames(obj: PngInfoObject): OriginalKeyPngInfoObject {
    const reversedKeyMapping: { [key: string]: string } = Object.keys(keyMapping).reduce((acc: { [key: string]: string }, key: string) => {
        acc[keyMapping[key]] = key;
        return acc;
    }, {})

    const newObj: Partial<OriginalKeyPngInfoObject> = {};
    for (const key in obj) {
        if (reversedKeyMapping[key]) {
            newObj[reversedKeyMapping[key]] = obj[key];
        } else {
            newObj[key] = obj[key];
        }
    }

    return newObj as OriginalKeyPngInfoObject;
}