import Stopwatch from "./Stopwatch.js";
import seedrandom from "seedrandom";
import fs from "fs";

export default class API {
  constructor(Ipfs, OrbitDB) {
    this.Ipfs = Ipfs;
    this.OrbitDB = OrbitDB;
    this.start = 0;
    this.end = 0;
    this.put_duration = 0;
    this.prefix = "key";
  }

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

  // put key-value pairs into the database
  async put(keyNumbers, valueSize) {
    let rand_string = "";
    for (let i = 0; i < keyNumbers; i++) {
      rand_string = randStr(valueSize);
      console.log(`{key: ${this.prefix}-${i}, value: ${rand_string}}`);
      this.start = performance.now();
      await this.exp.put(`${this.prefix}-${i}`, rand_string);
      this.end = performance.now();
      this.put_duration = this.put_duration + (this.end - this.start);
    }
    console.log(`duration: ${this.put_duration}`);
    this.writeToFile();
  }

  // get a value from the database // TODO
  async get() {
    const value = await this.exp.get("key-0");
    return value;
  }

  // write the time measurement to a csv file
  writeToFile() {
    const date = new Date();
    const data = `
      id, put_duration, get_duration
       ${date.getTime()} ,${this.put_duration}, 0
    `;
    fs.appendFile("timeMeasurement.csv", data, (err) => {
      if (err) throw err;
      console.log("Saved!");
    });
  }
}

// generate random string
const randStr = (valueSize) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const charLength = chars.length;
  let result = "";
  // Seeded random number generator
  const rng = seedrandom();
  for (var i = 0; i < valueSize; i++) {
    result += chars.charAt(Math.floor(rng() * charLength));
  }
  return result;
};
