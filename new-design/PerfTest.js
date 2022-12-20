import data from "./index.js";
import getInputData from "./index.js";
import writeToFile from "./WriteToFile.js";
import Cache from "orbit-db-cache";

// conect to db
const db = data.dbConnection;
const conncetion = await db();
const cache = new Cache();
let putDuration = 0;
let getDuration = 0;
let delDuration = 0;
let putIndex = 0;
let getIndex = 0;
let delIndex = 0;

const _valueSize = getInputData.getInputData().valueSize;
const _writeToFile = writeToFile;

/**
 * @description put all keys to db
 * @param {number} keyNumber
 */
const put = async (keyNumber) => {
  for (let i = 0; i < keyNumber; i++) {
    const rand_string = randStr();
    const start = performance.now();
    await conncetion.put(`key-${putIndex}`, rand_string);
    const end = performance.now();
    putDuration += end - start;
    console.log(rand_string);
    putIndex++;
  }
  console.log(`put done in duration: ${putDuration} ms`);
};

/**
 * @description get all keys from db
 * @param {number} keyNumber
 */
const get = async (keyNumber) => {
  for (let i = 0; i < keyNumber; i++) {
    const start = performance.now();
    const value = conncetion.get(`key-${getIndex}`);
    const end = performance.now();
    getDuration += end - start;
    console.log(value);
    getIndex++;
  }
  console.log(`get done in duration: ${getDuration} ms`);
};

/**
 * @description delete all keys from db
 * @param {number} keyNumber
 */
const del = async (keyNumber) => {
  for (let i = 0; i < keyNumber; i++) {
    const start = performance.now();
    await conncetion.del(`key-${delIndex}`);
    const end = performance.now();
    delDuration += end - start;
    delIndex++;
  }
  console.log(`del done in duration: ${delDuration} ms`);
  _writeToFile(keyNumber, _valueSize, putDuration, getDuration, delDuration);
  putDuration = 0;
  getDuration = 0;
  delDuration = 0;
};

const delCache = async (keyNumber) => {
  console.log("delCache");
  for (let i = 0; i < keyNumber; i++) {
    const value = await cache.del(`key-${i}`);
    console.log(value);
  }
};

/**
 * @description generate random string
 * @returns {string} random string
 */
const randStr = () => {
  const rng = data.rng;
  // const chars =
  //   "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
  delCache,
};

export default apiFunctions;
