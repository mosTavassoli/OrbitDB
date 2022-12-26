import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
// import seedrandom from "seedrandom";
// import getInputData from "./GetInputData.js";
// import { EventEmitter } from "events";
// increase the number of listeners. Default is 10, otherwise it will throw a warning
// EventEmitter.defaultMaxListeners = 10000000;

/**
 * @description connect to the orbitdb database
 * @returns {Promise<OrbitDB.KeyValueStore>}
 */
const dbConnection = async () => {
  console.log("connecting to db");
  const ipfsOptions = {
    relay: { enabled: true, hop: { enabled: true, active: true } },
    // repo: "./ipfs",
    EXPERIMENTAL: {
      pubsub: true,
      config: {
        Addresses: {
          // ...And supply a swarm address to announce on to find other peers
          Swarm: [
            "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
          ],
        },
      },
    },
  };
  const ipfs = await Ipfs.create(ipfsOptions);
  // const orbitdb = await OrbitDB.createInstance(ipfs);
  await ipfs.bootstrap.list();
  await ipfs.bootstrap.reset();
  // console.log(await ipfs.bootstrap.list());

  console.log(await ipfs.config.get("Addresses.Swarm"));
  // console.log(await ipfs.swarm.peers());
  console.log(await ipfs.id());
  // const db = await orbitdb.keyvalue("test", {
  //   overwrite: true,
  //   replicate: true,
  //   accessController: {
  //     write: ["*"],
  //   },
  // });
  // await db.load();
  // return db;
};

// const rng = seedrandom();
const data = {
  dbConnection,
  //   rng,
  //   getInputData,
};

dbConnection();
// export default data;
