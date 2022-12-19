import data from "./index.js";
import getInputData from "./index.js";
import writeToFile from "./WriteToFile.js";

// conect to db
const db = data.dbConnection;
const conncetion = await db();
let putDuration = 0;
let getDuration = 0;
let delDuration = 0;

const _valueSize = getInputData.getInputData().valueSize;
const _writeToFile = writeToFile;

// Put all keys to db - async
const put = async (keyNumber) => {
  let start = 0;
  let end = 0;
  for (let i = 0; i < keyNumber; i++) {
    const rand_string = randStr();
    start = performance.now();
    await conncetion.put(`key-${i}`, rand_string);
    end = performance.now();
    putDuration += end - start;
  }
  console.log(`put done in duration: ${putDuration} ms`);
};

// Get all keys from db
const get = async (keyNumber) => {
  let start = 0;
  let end = 0;
  for (let i = 0; i < keyNumber; i++) {
    start = performance.now();
    await conncetion.get(`key-${i}`);
    end = performance.now();
    getDuration += end - start;
  }
  console.log(`get done in duration: ${getDuration} ms`);
};

// Delete all keys from db
const del = async (keyNumber) => {
  let start = 0;
  let end = 0;
  for (let i = 0; i < keyNumber; i++) {
    start = performance.now();
    await conncetion.del(`key-${i}`);
    end = performance.now();
    delDuration += end - start;
  }
  console.log(`delete done in duration: ${delDuration} ms`);
  _writeToFile(keyNumber, _valueSize, putDuration, getDuration, delDuration);
  putDuration = 0;
  getDuration = 0;
  delDuration = 0;
};

// Generate random string
const randStr = () => {
  const rng = data.rng;
  // const chars =
  //   "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let j = 0; j < _valueSize; j++) {
    result += chars.charAt(Math.floor(rng() * chars.length));
  }
  return result;
};

const apiFunctions = {
  put,
  get,
  del,
};

export default apiFunctions;