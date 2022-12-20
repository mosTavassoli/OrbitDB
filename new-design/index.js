import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import seedrandom from "seedrandom";
import getInputData from "./GetInputData.js";
import { EventEmitter } from "events";
// increase the number of listeners. Default is 10, otherwise it will throw a warning
EventEmitter.defaultMaxListeners = 10000000;

// create a new instance of ipfs and connect to the orbitdb database
const dbConnection = async () => {
  console.log("connecting to db");
  const ipfsOptions = {
    repo: "./ipfs",
    start: true,
    EXPERIMENTAL: {
      pubsub: true,
    },
  };
  const ipfs = await Ipfs.create(ipfsOptions);
  const orbitdb = await OrbitDB.createInstance(ipfs);
  const db = await orbitdb.keyvalue("test", {
    overwrite: true,
    replicate: true,
    accessController: {
      write: ["*"],
    },
  });
  await db.load();
  return db;
};

// create a random number generator

const rng = seedrandom();
const data = {
  dbConnection,
  rng,
  getInputData,
};

export default data;

// https://github.com/orbitdb/orbit-db-types/blob/main/DBOptions.d.ts
