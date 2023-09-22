const { getInfotext, getInfotextJson } = require("chilled-lemon");
const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

(async () => {
  const defaultFileName = "test.png";
  const filename = process.argv[2] || defaultFileName;
  const buf = await readFile(resolve(filename));
  const infotext = await getInfotext(buf);
  console.log(infotext);

  const json = await getInfotextJson(buf);
  console.log(json);
})();
