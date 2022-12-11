import Stopwatch from "./Stopwatch.js";

export default class API {
  constructor(Ipfs, OrbitDB) {
    this.Ipfs = Ipfs;
    this.OrbitDB = OrbitDB;
  }

  prefix = "key";
  stopWatch = new Stopwatch();

  async create() {
    this.node = await this.Ipfs.create({
      preload: { enabled: false },
      // relay: { enabled: true, hop: { enabled: true, actice: true } },
      repo: "./ipfs",
      EXPERIMENTAL: { pubsub: true },
      config: {
        Bootstrap: [],
        Addresses: { Swarm: [] },
      },
    });

    await this._init();
  }

  async _init() {
    this.orbitdb = await this.OrbitDB.createInstance(this.node);
    this.defaultOptions = {
      accessController: {
        write: [this.orbitdb.identity.id],
      },
    };

    this.exp = await this.orbitdb.keyvalue("exp");
    await this.exp.load();

    this.onready();
  }

  async put(keyNumbers, valueSize) {
    let rand_string = "";
    this.stopWatch.start();

    for (let i = 0; i < keyNumbers; i++) {
      rand_string = randStr(valueSize);
      await this.exp.put(`${this.prefix}-${i}`, rand_string);
    }

    const stop = this.stopWatch.stop();
    console.log("stop: ", stop);
    this.stopWatch.reset();
  }

  async get() {
    const key = `${this.prefix}-${Math.floor(Math.random() * 10)}`;
    console.log("key: ", key);
    const value = await this.exp.get(key);
    return value;
  }
}

const randStr = (valueSize) => {
  const stringSample = [
    "OrbitDb is a serverless database.",
    "OrbitDB uses IPFS.",
    "OrbitDB is an excellent choice for decentralized apps.",
    "uses CRDTs for conflict-free database merges.",
  ];
  const generatedString = [];
  for (let i = 0; i < valueSize; i++) {
    generatedString.push(
      stringSample[Math.floor(Math.random() * stringSample.length)]
    );
  }
  return generatedString.join(" ");
};
