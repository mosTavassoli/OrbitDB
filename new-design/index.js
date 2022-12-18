import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import seedrandom from "seedrandom";
import getInputData from "./GetInputData.js";
import { EventEmitter } from "events";
// increase the number of listeners. Default is 10, otherwise it will throw a warning
EventEmitter.defaultMaxListeners = 1000;

const dbConnection = async () => {
  const ipfsOptions = { repo: "./ipfs" };
  const ipfs = await Ipfs.create(ipfsOptions);
  const orbitdb = await OrbitDB.createInstance(ipfs);
  const db = await orbitdb.keyvalue("test", { overwrite: true });
  await db.load();
  return db;
};

const rng = seedrandom();
const data = {
  dbConnection,
  rng,
  getInputData,
};

export default data;
