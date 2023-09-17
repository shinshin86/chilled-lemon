type FormatOptions = 'json' | 'text';

interface Options {
    format?: FormatOptions;
}

// Values that are always used are stored from the beginning
const keyMapping = {
    negativePrompt: "Negative prompt",
    steps: "Steps",
    sampler: "Sampler",
    cfgScale: "CFG scale",
    seed: "Seed",
    size: "Size",
    modelHash: "Model hash",
    model: "Model",
    version: "Version",
}

// Values that are always used are stored from the beginning
const controlNetKeyMapping = {
    module: "Module",
    model: "Model",
    weight: "Weight",
    resizeMode: "Resize Mode",
    lowVram: "Low Vram",
    processorRes: "Processor Res",
    guidanceStart: "Guidance Start",
    guidanceEnd: "Guidance End",
    pixelPerfect: "Pixel Perfect",
    controlMode: "Control Mode",
}

type LoraHash = {
    [key: string]: string
}


type PngInfoObject = {
    steps: number,
    sampler: string,
    cfgScale: number,
    seed: number,
    size: string,
    modelHash: string,
    model: string,
    loraHashes?: Array<LoraHash>,
    version: string,
    prompt: Array<string>,
    negativePrompt: Array<string>,
    controlNetList?: Array<Partial<ControlNetInfoObject>>,
    // Because there are a myriad of keys depending on the functionality provided, we allow arbitrary properties
    [key: string]: any,
}

type OriginalKeyPngInfoObject = {
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
    // Because there are a myriad of keys depending on the functionality provided, we allow arbitrary properties
    [key: string]: any,
}

type ControlNetInfoObject = {
    key: string, // ControlNet 0, ControlNet 1...
    module: string,
    model: string,
    weight: string,
    resizeMode: string,
    lowVram: string,
    processorRes: number,
    guidanceStart: string,
    guidanceEnd: string,
    pixelPerfect: boolean,
    controlMode: string,
    // Because there are a myriad of keys depending on the functionality provided, we allow arbitrary properties
    [key: string]: any,
}

/**
 * This function converts a Python boolean string ("True" or "False") to a JavaScript boolean type.
 */
function pythonBoolToJsBool(str: string): boolean | null {
    if (typeof str !== 'string') {
      return null;
    }
    return str.toLowerCase() === "true" ? true : str.toLowerCase() === "false" ? false : null;
  }


/**
 * @deprecated Use `getInfotext` or `getInfotextJson` instead.
 */
async function getPngInfo(arrayBuffer: ArrayBuffer, options?: Options): Promise<PngInfoObject | string> {
    const infotext = await getInfotext(arrayBuffer);

    const isFormatJson = !options || !options.format || options.format === 'json';
    if (isFormatJson) {
        return getPngInfoJson(infotext);
    } else if (options.format === 'text') {
        return infotext;
    }
}

async function getInfotext(arrayBuffer: ArrayBuffer): Promise<string> {
    const buffer = new Uint8Array(arrayBuffer);
    const fileSignature = buffer.slice(0, 8);

    const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const crcSize = 4;
    let infotext = "";

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
                infotext = chunkType === 'tEXt' ? new TextDecoder("iso-8859-1").decode(data) : new TextDecoder("utf-8").decode(data);
                break;
            }
        } else {
            position += view;
        }

        position += crcSize;
    }

    return infotext
}

async function getInfotextJson(arrayBuffer: ArrayBuffer): Promise<PngInfoObject> {
    const infotext = await getInfotext(arrayBuffer);

    return getPngInfoJson(infotext);
}

function getPngInfoJson(infoString: string): PngInfoObject {
    const lines = infoString.split("\n");
    let phase = 0;
    let prompt = "";
    let negativePrompt = "";
    let controlNetList: Array<Partial<ControlNetInfoObject>> = [];
    let data: Partial<PngInfoObject> = {};

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
            let re = /([a-zA-Z0-9\s]+):\s*("[^"]+"|[^,]+)/g;
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
                    data[convertToCamelCase(key)] = loraHashes;
                } else if (key === 'TI hashes') {
                    const tiHashes = [];
                    const tiHashesParts = value.split(', ');
                    for (const part of tiHashesParts) {
                        const [tiKey, tiValue] = part.split(': ');
                        tiHashes.push({ [tiKey]: tiValue });
                    }
                    data[convertToCamelCase(key)] = tiHashes;
                } else if(key.startsWith("ControlNet")) {
                    const controlNetObj: Partial<ControlNetInfoObject> = { key }

                    let controlNetRe = /([a-zA-Z0-9\s]+):\s*("[^"]+"|[^,]+)/g;
                    let controlNetMatch = controlNetRe.exec(value);
                    while(controlNetMatch !== null) {
                        const controlNetKey = controlNetMatch[1].trim();
                        const controlNetValue = controlNetMatch[2].trim();

                        if(controlNetKey === "Processor Res") {
                            controlNetObj[convertToCamelCase(controlNetKey)] = Number(controlNetValue);
                        } else if (controlNetKey === "Pixel Perfect") {
                            const jsBool = pythonBoolToJsBool(controlNetValue);

                            if(jsBool !== null) {
                                controlNetObj[convertToCamelCase(controlNetKey)] = jsBool;
                            }
                        } else {
                            controlNetObj[convertToCamelCase(controlNetKey)] = controlNetValue;
                        }

                        controlNetMatch = controlNetRe.exec(value);
                    }

                    controlNetList.push(controlNetObj);
                } else {
                    data[convertToCamelCase(key)] = value;
                }
            }
        }
    }

    data[convertToCamelCase("Prompt")] = prompt.trim().split(',').map(item => item.trim()).filter(item => item);
    data[convertToCamelCase("Negative prompt")] = negativePrompt.trim().split(',').map(item => item.trim()).filter(item => item);

    if(controlNetList?.length > 0) {
        data = {...data, controlNetList}
    }

    return data as PngInfoObject;
}

function getOriginalKeyNames(obj: PngInfoObject): OriginalKeyPngInfoObject {
    const reversedKeyMapping: { [key: string]: string } = Object.keys(keyMapping).reduce((acc: { [key: string]: string }, key: string) => {
        const camelCasedKey = convertToCamelCase(key)
        acc[camelCasedKey] = key;
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

     // Handling controlNetList transformation
     if (newObj.controlNetList) {
        obj.controlNetList.forEach((controlNet: ControlNetInfoObject) => {
            const controlNetObj: { [key: string]: any } = {};
            for (const controlNetKey in controlNet) {
                // The item "key" is not necessary
                if (controlNetKey === "key") {
                    continue;
                }

                controlNetObj[controlNetKeyMapping[controlNetKey]] = controlNet[controlNetKey];
            }
            newObj[controlNet.key] = controlNetObj;
        });

        // Removing the original controlNetList property as it is not needed in the new object
        delete newObj.controlNetList;
    }

    return newObj as OriginalKeyPngInfoObject;
}

function convertToCamelCase(input: string): string {
    if (!keyMapping[input]) {
        const convertedInput = input
            .split(' ')
            .map((word, index) =>
                index === 0
                    ? word.toLowerCase()
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');

        // store keyMapping
        keyMapping[input] = convertedInput;
    }

    return keyMapping[input];
}

function convertInfotextToJson (infotext: string): PngInfoObject {
    return getPngInfoJson(infotext);
}

function listPropertiesExcept(obj) {
    let result = '';
    for (const key in obj) {
      if (key !== 'prompt' && key !== 'negativePrompt' && obj[key]) {
        result += `${keyMapping[key]}: ${obj[key]}, `;
      }
    }

    return result.slice(0, -2);
  }

function convertJsonToInfotext(json: PngInfoObject): string {
    let infotext = json?.prompt.join(", ") || '';

    if(!!json?.negativePrompt.length) {
        infotext += '\n';
        infotext += "Negative prompt: " + json?.negativePrompt.join(", ");
    }

    const otherKeyAndValues = listPropertiesExcept(json);
    if(otherKeyAndValues) {
        infotext += '\n';
        infotext += otherKeyAndValues;
    }

    return infotext;
}

export {
    getPngInfo,
    getInfotext,
    getInfotextJson,
    getOriginalKeyNames,
    convertInfotextToJson,
    convertJsonToInfotext,
    PngInfoObject,
    OriginalKeyPngInfoObject,
    LoraHash,
}