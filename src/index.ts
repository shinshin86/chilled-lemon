type FormatOptions = 'json' | 'text';

interface Options {
    format?: FormatOptions;
}

export async function getPngInfo(arrayBuffer: ArrayBuffer, options?: Options): Promise<string> {
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

async function getPngInfoJson(infoString: string): Promise<string> {
    const lines = infoString.split("\n");
    let phase = 0;
    let prompt = "";
    let negativePrompt = "";
    const data = {};

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
            let matchData;
            while ((matchData = re.exec(line)) !== null) {
                const [_, word] = matchData;
                const re2 = /([A-Z][a-zA-Z0-9 ]*): ([^,]+)(, )?/g;
                let matchData2;
                while ((matchData2 = re2.exec(word)) !== null) {
                    const [_, name, value] = matchData2;
                    data[name] = value;
                }
            }
        }
    }

    data["Prompt"] = prompt.trim();
    data["Negative prompt"] = negativePrompt.trim();

    return JSON.stringify(data);
}