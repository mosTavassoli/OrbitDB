import moment from "moment";
import data from "./index.js";
import getInputData from "./index.js";
import writeToFile from "./WriteToFile.js";
import Cache from "orbit-db-cache";

// conect to db
const db = data.dbConnection;
const conncetion = await db();
const cache = new Cache(conncetion);
let putDuration = 0;
let getDuration = 0;
let delDuration = 0;
let strDuration = 0;

const _valueSize = getInputData.getInputData().valueSize;
const _writeToFile = writeToFile;

// Put all keys to db - async
const put = async (keyNumber) => {
  for (let i = 0; i < keyNumber; i++) {
    console.log(i);
    // const rand_string = randStr();
    // const start = performance.now();
    // await conncetion.put(`key-${i}`, rand_string);
    // const end = performance.now();
    // putDuration += end - start;
    const rand_string = randStr();
    const start = moment();
    await conncetion.put(`key-${i}`, rand_string);
    const end = moment();
    putDuration += end.diff(start, "milliseconds");
    console.log(`key-${i}`, rand_string);
  }
  console.log(`put done in duration: ${putDuration} ms`);
};

// Get all keys from db
const get = async (keyNumber) => {
  for (let i = 0; i < keyNumber; i++) {
    const start = moment();
    const value = await conncetion.get(`key-${i}`);
    const end = moment();
    getDuration += end.diff(start, "milliseconds");
    console.log(value);
  }
  console.log(`get done in duration: ${getDuration} ms`);
};

// Delete all keys from db
const del = async (keyNumber) => {
  for (let i = 0; i < keyNumber; i++) {
    const start = moment();
    await conncetion.del(`key-${i}`);
    const end = moment();
    delDuration += end.diff(start, "milliseconds");
  }
  console.log(`delete done in duration: ${delDuration} ms`);
  _writeToFile(keyNumber, _valueSize, putDuration, getDuration, delDuration);
  putDuration = 0;
  getDuration = 0;
  delDuration = 0;
};

const delCache = async (keyNumber) => {
  console.log("delCache");
  for (let i = 0; i < keyNumber; i++) {
    const value = await cache.get(`key-${i}`);
    console.log(value);
  }
};

// Generate random string
const randStr = () => {
  const rng = data.rng;
  // const chars =
  //   "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let j = 0; j < _valueSize; j++) {
    result += chars.charAt(Math.floor(rng() * chars.length));
  }

  // strDuration += stop - start;
  // console.log(`randStr done in duration: ${stop - start} ms`);
  // console.log(`strDuration: ${strDuration} ms`);
  return result;
};

const apiFunctions = {
  put,
  get,
  del,
  delCache,
};

export default apiFunctions;
