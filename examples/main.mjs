import { getInfotext, getInfotextJson } from "chilled-lemon";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const defaultFileName = "test.png";
const filename = process.argv[2] || defaultFileName;
const buf = await readFile(resolve(filename));

const infotext = await getInfotext(buf);
console.log(infotext);

const json = await getInfotextJson(buf);
console.log(json);
