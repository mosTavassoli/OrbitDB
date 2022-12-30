import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import { Config } from "./config.producer.js";
import createIdentity from "orbit-db-identity-provider";

let ipfs;
let orbitdb;
let database;
let intervalHandle;

// onShutdown("producer", async () => {
//   console.info("Shutting down");
//   if (intervalHandle) {
//     clearInterval(intervalHandle);
//   }
//   await orbitdb.stop();
//   await ipfs.stop();
//   console.info("Done");
// });

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
    "/ip4/172.16.226.132/tcp/4011/p2p/QmckaRMbvgaTCPQuLTRXRS79iQkKpVY3wFG1B2kZ8P86NE"
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

const bootOrbitdb = async () => {
  console.info("Starting OrbitDb...");

  // This is a way to create an OrbitDB identity based on external ids!
  const identity = await createIdentity.createIdentity({ id: "privateKey" });
  orbitdb = await OrbitDB.createInstance(ipfs, { identity });
  console.info(
    `Orbit Database instantiated ${JSON.stringify(orbitdb.identity)}`
  );

  // Granting write access to all
  // In a real world scenario this should be limited
  database = await orbitdb.docstore("producer", {
    accessController: {
      write: ["*"],
    },
  });

  // loading only one item is faster than loading all....
  // but at least one is needed
  await database.load(1);

  // The address is used by others who wants to access the database, i.e. consumer
  console.info("\n===========================================");
  console.info("Database initialized");
  console.info(`Address: ${database.address}`);
  console.info("===========================================");
};

const publishIpfsMessage = async (topic, message) => {
  await ipfs.pubsub.publish(topic, message);
  console.info(`published [${message.toString()}] to ${topic}`);
};

const writeDatabase = async (data) => {
  const hash = await database.put(data);
  console.info("put into database:", hash, JSON.stringify(data));
};

const subscribeDatabaseUpdates = () => {
  database.events.on("replicate", (address, { payload }) => {
    console.info(`${address} updated database`, JSON.stringify(payload));
  });
};

const getLatestId = async () => {
  const entries = await database.get("");
  let i = 0;
  if (entries.length) {
    const id = entries[entries.length - 1]._id;
    i = parseInt(id.replace("p-", "").replace("c-", ""));
  }
  console.info(`Loaded ${entries.length} entries, last id: ${i}`);
  return i;
};

const getPeers = async () => {
  console.log(await ipfs.swarm.peers());
};

const start = async () => {
  await bootIpfs();
  await getPeers();
  await bootOrbitdb();
  subscribeDatabaseUpdates();

  let i = await getLatestId();
  intervalHandle = setInterval(async () => {
    i += 1;
    await publishIpfsMessage(
      "orbitdb-remote-poc",
      Buffer.from(`producer_${i}`)
    );
    await writeDatabase({ _id: `p-${i}`, msg: "from producer" + i });
  }, 5000);
};

start();
