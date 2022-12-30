/**
 * This is the consumer side of the replication example.
 * It connects to the producer and subscribes to the database updates.
 * It also writes data to the database.
 * @module consumer
 * @requires ipfs
 * @requires orbit-db
 * @requires config
 * @description To run it properly, you need to run the producer first. Then run the consumer with the database address as an argument.
 * need to install the ipfs version 0.46.0 via npm install, otherwise the pubsub will not work.
 */

import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import { Config } from "./config.js";

let ipfs;
let intervalHandle;
let orbitdb;
let database;

/**
 * Boot IPFS
 * @returns {Promise<void>}
 * @async
 * @name bootIpfs
 * @description Boot IPFS based on the configuration in config.js. The config file provides the IPFS daemon address, and Bootstrap nodes.
 */
const bootIpfs = async () => {
  console.info("Booting IPFS...");
  console.info("Connecting to IPFS daemon", JSON.stringify(Config));
  ipfs = await Ipfs.create(Config);
  const id = await ipfs.id();

  console.info("\n===========================================");
  console.info("IPFS booted");
  console.info("-------------------------------------------");
  console.info(id);
  console.info("===========================================\n\n");

  console.info("\n===========================================");
  console.info("Bootstrap Nodes");
  console.info("-------------------------------------------");
  console.info(await ipfs.bootstrap.list());
  console.info("===========================================\n\n");

  ipfs.libp2p.on("peer:disconnect", (peerId) => {
    console.info('Lost Connection"', JSON.stringify(peerId.id));
  });

  ipfs.libp2p.on("peer:connect", (peer) => {
    console.info("Producer Found:", peer.id);
  });
};

/**
 * @param {String} databaseAddress
 * @returns {Promise<void>}
 * @async
 * @name bootOrbitdb
 * @description Get the database address from the producer, and open the database.
 */
const bootOrbitdb = async (databaseAddress) => {
  console.info("Starting OrbitDb...");
  orbitdb = await OrbitDB.createInstance(ipfs);
  console.info("Orbit Database instantiated");
  console.info("-------------------------------------------");
  console.info(JSON.stringify(orbitdb.identity.id));
  database = await orbitdb.open(databaseAddress);
  console.info("-------------------------------------------");
  await database.load(1);

  console.info("\n===========================================");
  console.info("Database initialized");
  console.info(`Address: ${database.address}`);
  console.info("===========================================");
};

/**
 * @param {String} topic
 * @returns {Promise<void>}
 * @async
 * @name subscribeTopic
 * @description Subscribe to a topic on the IPFS pubsub network.
 */
const subscribeTopic = (topic) => {
  ipfs.pubsub.subscribe(topic, (msg) => console.info(msg.data.toString()));
  console.info(`subscribed to ${topic}`);
};

/**
 * @returns {Promise<void>}
 * @async
 * @name subscribeReplication
 * @description Subscribe to the replication events on the database.
 */
const subscribeReplication = () => {
  const replicatedHandler = async (address, count) => {
    console.info(`${address} updated ${count} items`);
  };

  const replicateHandler = async (address, { payload }) => {
    if (!payload) return Promise.resolve();

    console.info(`${address} replicated entry`, JSON.stringify(payload));
    const id = payload.value._id.replace("p-", "");
    console.log(payload.value);
    // Write back -- doing two-directional write on the database
    // The creator must grant write access
    await database.put({ _id: `c-${id}`, msg: `from consumer: ${id}` });
    await database.get(`p-${id}`);
  };

  database.events.on("replicate", replicateHandler);
  database.events.on("replicated", replicatedHandler);
};

/**
 * @returns {Promise<void>}
 * @async
 * @name consumerStart
 * @description Start the consumer.
 */
const consumerStart = async () => {
  const databaseAddress = process.argv[2];

  if (!databaseAddress) {
    throw Error("Need an address argument");
  }
  await bootIpfs();
  await bootOrbitdb(databaseAddress);
  subscribeTopic("orbitdb-remote-poc");
  subscribeReplication();
};

consumerStart();
