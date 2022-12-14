import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import { Config } from "./config.consumer.js";

let ipfs;
let intervalHandle;
let orbitdb;
let database;

// onShutdown("consumer", async () => {
//   console.info("Shutting down");
//   if (intervalHandle) {
//     clearInterval(intervalHandle);
//   }
//   await orbitdb.stop();
//   await ipfs.stop();
//   console.info("Done");
// });

async function bootIpfs() {
  console.info("Booting IPFS...");
  console.info("Connecting to IPFS daemon", JSON.stringify(Config));
  ipfs = await Ipfs.create(Config);
  const id = await ipfs.id();

  console.info("\n===========================================");
  console.info("IPFS booted");
  console.info("-------------------------------------------");
  console.info(id);
  console.info("===========================================\n\n");

  ipfs.libp2p.on("peer:disconnect", (peerId) => {
    console.info('Lost Connection"', JSON.stringify(peerId.id));
  });

  ipfs.libp2p.on("peer:connect", (peer) => {
    console.info("Producer Found:", peer.id);
  });

  // If you don't know the IP of the connected counter part on the beginning,
  // you can add it dynamically, i.e. using a kind of handshake
  // await ipfs.bootstrap.add("/ip4/77.56.66.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaC7HZ")
}

async function bootOrbitdb(databaseAddress) {
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
}

function subscribeTopic(topic) {
  ipfs.pubsub.subscribe(topic, (msg) => console.info(msg.data.toString()));
  console.info(`subscribed to ${topic}`);
}

function subscribeReplication() {
  const replicatedHandler = async (address, count) => {
    console.info(`${address} updated ${count} items`);
  };

  const replicateHandler = async (address, { payload }) => {
    if (!payload) return Promise.resolve();

    console.info(`${address} replicated entry`, JSON.stringify(payload));
    const id = payload.value._id.replace("p-", "");

    // Write back -- doing two-directional write on the database
    // The creator must grant write access
    await database.put({ _id: `c-${id}`, msg: `from consumer: ${id}` });
  };

  database.events.on("replicate", replicateHandler);
  database.events.on("replicated", replicatedHandler);
}

async function start() {
  const databaseAddress = process.argv[2];

  if (!databaseAddress) {
    throw Error("Need an address argument");
  }
  await bootIpfs();
  await bootOrbitdb(databaseAddress);
  subscribeTopic("orbitdb-remote-poc");
  subscribeReplication();
}

start();
