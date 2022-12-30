/**
 * @file producer.js
 * @description This file is the entry point for the producer. It is responsible for booting IPFS, and OrbitDB, and then creating a database.
 */

import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import { Config } from "./config.js";
import createIdentity from "orbit-db-identity-provider";

let ipfs;
let orbitdb;
let database;
let intervalHandle;

/**
 * Boot IPFS
 * @returns {Promise<void>}
 * @async
 * @name bootIpfs
 * @description Boot IPFS based on the configuration in config.js. The config file provides the IPFS daemon address, and Bootstrap nodes.
 */
const bootIpfs = async () => {
  console.info("Booting IPFS...");
  ipfs = await Ipfs.create(Config);
  const id = await ipfs.id();
  console.info("\n===========================================");
  console.info("IPFS booted");
  console.info("-------------------------------------------");
  console.info(id);
  console.info("===========================================\n\n");

  console.info("\n===========================================");
  console.info("Connect to Peer");
  console.info("-------------------------------------------");
  await ipfs.swarm.connect(
    "/ip4/172.16.226.132/tcp/4011/p2p/QmacGaFBSQGKZweKtWXNX6vTXGEnSPZgrjxme9b9PeEMzf"
  );
  console.info(await ipfs.swarm.peers());
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
 * Boot OrbitDB
 * @returns {Promise<void>}
 * @async
 * @name bootOrbitdb
 * @description Boot OrbitDB based on ipfs instance. The database is created with write access to all.
 */
const bootOrbitdb = async () => {
  console.info("Starting OrbitDb...");

  // This is a way to create an OrbitDB identity based on external ids!
  const identity = await createIdentity.createIdentity({ id: "privateKey" });
  orbitdb = await OrbitDB.createInstance(ipfs, { identity });
  console.info(
    `Orbit Database instantiated ${JSON.stringify(orbitdb.identity)}`
  );

  // Granting write access to all
  // In a real world scenario this should be limited to a specific set of peers
  database = await orbitdb.docstore("producer", {
    accessController: {
      write: ["*"],
    },
  });

  // loading only one item is faster than loading all....
  // but at least one is needed
  await database.load(1);

  // The address is used by others who wants to access the database
  console.info("\n===========================================");
  console.info("Database initialized");
  console.info(`Address: ${database.address}`);
  console.info("===========================================");
};

/**
 * Publish a message to IPFS
 * @param {string} topic - The topic to publish to
 * @param {Buffer} message - The message to publish
 * @returns {Promise<void>}
 * @async
 * @name publishIpfsMessage
 * @description Publish a message to IPFS
 */
const publishIpfsMessage = async (topic, message) => {
  await ipfs.pubsub.publish(topic, message);
  console.info(`published [${message.toString()}] to ${topic}`);
};

/**
 *
 * @param {Object} data
 * @returns {Promise<void>}
 * @async
 * @name writeDatabase
 * @description Write data to the database
 */
const writeDatabase = async (data) => {
  const hash = await database.put(data);
  console.info("put into database:", hash, JSON.stringify(data));
};

/**
 * Subscribe to database updates
 * @returns {void}
 * @name subscribeDatabaseUpdates
 * @description Subscribe to database updates
 * @description This is only used for logging purposes, the replicated event occurs in the OrbitDB key-value database.
 */
const subscribeDatabaseUpdates = () => {
  database.events.on("replicate", (address, { payload }) => {
    console.info(`${address} updated database`, JSON.stringify(payload));
  });
};

/**
 * @returns {Promise<number>}
 * @async
 * @name getLatestId
 * @description Get the latest id from the database
 */
const getLatestId = async () => {
  const entries = await database.get("");
  console.log(Object.keys(entries).length);
  let i = 0;
  if (entries.length) {
    const id = entries[entries.length - 1]._id;
    i = parseInt(id.replace("p-", "").replace("c-", ""));
  }
  console.info(`Loaded ${entries.length} entries, last id: ${i}`);
  return i;
};

/**
 * @returns {Promise<void>}
 * @async
 * @name getPeers
 * @description Get the peers connected to the IPFS node
 */
const getPeers = async () => {
  console.log(await ipfs.swarm.peers());
};

/**
 * @returns {Promise<void>}
 * @async
 * @name start
 * @description Start the producer
 */
const startProducer = async () => {
  await bootIpfs();
  await getPeers();
  await bootOrbitdb();
  subscribeDatabaseUpdates();
  let i = await getLatestId();

  // Publish a message every 5 seconds
  intervalHandle = setInterval(async () => {
    i += 1;
    await publishIpfsMessage(
      "orbitdb-remote-poc",
      Buffer.from(`producer_${i}`)
    );
    await writeDatabase({ _id: `p-${i}`, value: "from producer" + i });
  }, 5000);
};

startProducer();
