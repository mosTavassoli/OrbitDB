import fs from "fs";

export default class API {
  constructor(Ipfs, OrbitDB, keyNumbers, valueSize, rng) {
    console.log("API constructor called");
    this.Ipfs = Ipfs;
    this.OrbitDB = OrbitDB;
    this.putDuration = 0;
    this.getDuration = 0;
    this.prefix = "key";
    this.keyNumber = keyNumbers;
    this.valueSize = valueSize;
    this.rng = rng; // Seeded random number generator
  }

  async create() {
    this.node = await this.Ipfs.create({
      preload: { enabled: false },
      repo: "./ipfs",
      // relay: { enabled: true, hop: { enabled: true, actice: true } },
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
    // await this.exp.load();
    this.onready();
  }

  // put key-value pairs into the database
  async put(keyNumber) {
    let start, end;
    // for testing
    console.log("----------------- put start -----------------");
    for (let i = 0; i < keyNumber; i++) {
      const rand_string = this.randStr();
      start = performance.now();
      await this.exp.put(`${this.prefix}-${i}`, rand_string);
      end = performance.now();
      this.putDuration += end - start;
    }
  }

  // get values from the database
  async get(keyNumber) {
    let start, end;
    console.log("----------------- get start -----------------");
    for (let i = 0; i < keyNumber; i++) {
      start = performance.now();
      // this.start = new Date().getTime();
      const value = await this.exp.get(`${this.prefix}-${i}`);
      end = performance.now();
      this.getDuration += end - start;
    }
    this.writeToFile(keyNumber);
  }

  // delete key-value pairs from the database
  // async del(keyNumber) {
  //   console.log("----------------- del start -----------------");
  //   for (let i = 0; i < keyNumber; i++) {
  //     await this.exp.del(`${this.prefix}-${i}`);
  //   }
  //   // console.log("delete done!");
  // }

  // async createFile() {
  //   if (fs.existsSync("timeMeasurement.csv")) {
  //     console.log("File already exists.");
  //   } else {
  //     fs.writeFile(
  //       "timeMeasurement.csv",
  //       "id, key_number, value_size, put_duration, get_duration\n",
  //       (err) => {
  //         if (err) throw err;
  //         console.log("File is created successfully.");
  //       }
  //     );
  //   }
  // }

  // write calculated time measurement to a csv file
  writeToFile(keyNumber) {
    const date = new Date();
    const data = `${date.getTime()}, ${keyNumber}, ${this.valueSize}, ${
      this.putDuration
    }, ${this.getDuration} \n`;
    const stream = fs.createWriteStream(
      `./logs/orbitdb_stats_${this.valueSize}.csv`,
      { flags: "a" }
    );
    stream.write(data);
    stream.end();
    this.putDuration = 0;
    this.getDuration = 0;
  }

  // generate random string
  randStr = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let result = "";
    for (let j = 0; j < this.valueSize; j++) {
      result += chars.charAt(Math.floor(this.rng() * chars.length));
    }
    return result;
  };
}
