import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import seedrandom from "seedrandom";
import getInputData from "./GetInputData.js";
import { EventEmitter } from "events";
// increase the number of listeners. Default is 10, otherwise it will throw a warning
EventEmitter.defaultMaxListeners = 10000000;

/**
 * @description connect to the orbitdb database
 * @returns {Promise<OrbitDB.KeyValueStore>}
 */
const dbConnection = async () => {
  console.log("connecting to db");
  const ipfsOptions = {
    preload: { enabled: false },
    repo: "./ipfs",
    EXPERIMENTAL: {
      pubsub: true,
    },
  };
  const ipfs = await Ipfs.create(ipfsOptions);
  const orbitdb = await OrbitDB.createInstance(ipfs);
  const db = await orbitdb.keyvalue("test", {
    overwrite: true,
    accessController: {
      write: ["*"],
    },
  });
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

// https://github.com/orbitdb/orbit-db-types/blob/main/DBOptions.d.ts
