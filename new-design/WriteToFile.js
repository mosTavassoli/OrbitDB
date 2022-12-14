import fs from "fs";

/**
 * @description write to file
 * @param {number} keyNumber
 * @param {number} valueSize
 * @param {number} putDuration
 * @param {number} getDuration
 * @param {number} delDuration
 */
const writeToFile = (
  keyNumber,
  valueSize,
  putDuration,
  getDuration,
  delDuration
) => {
  const date = new Date();
  const data = `${date.getTime()},${keyNumber},${valueSize},${putDuration},${getDuration},${delDuration}\n`;
  const stream = fs.createWriteStream(`./logs/orbitdb_stats_${valueSize}.csv`, {
    flags: "a",
  });
  stream.write(data);
  stream.end();
};

export default writeToFile;
