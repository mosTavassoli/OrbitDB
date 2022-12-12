import fs from "fs";

export default class API {
  constructor(Ipfs, OrbitDB, keyNumbers, valueSize, rng) {
    console.log("API constructor");
    this.Ipfs = Ipfs;
    this.OrbitDB = OrbitDB;
    this.start = 0;
    this.end = 0;
    this.putDuration = 0;
    this.getDuration = 0;
    this.prefix = "key";
    this.keyNumbers = keyNumbers;
    this.valueSize = valueSize;
    this.rng = rng; // Seeded random number generator
  }

  async createFile() {
    if (fs.existsSync("timeMeasurement.csv")) {
      console.log("File already exists.");
    } else {
      fs.writeFile(
        "timeMeasurement.csv",
        "id, key_number, value_size, put_duration, get_duration\n",
        (err) => {
          if (err) throw err;
          console.log("File is created successfully.");
        }
      );
    }
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
  async put() {
    let rand_string = "";
    console.log("----------------- put start -----------------");
    for (let i = 0; i < this.keyNumbers; i++) {
      rand_string = this.randStr();
      // console.log(`key: ${this.prefix}-${i}, value: ${rand_string}`);
      this.start = performance.now();
      await this.exp.put(`${this.prefix}-${i}`, rand_string);
      this.end = performance.now();
      this.putDuration += this.end - this.start;
    }
    console.log(`duration: ${this.putDuration}`);
  }

  // get values from the database
  async get() {
    console.log("----------------- get start -----------------");
    for (let i = 0; i < this.keyNumbers; i++) {
      this.start = performance.now();
      const value = await this.exp.get(`${this.prefix}-${i}`);
      this.end = performance.now();
      this.getDuration += this.end - this.start;
    }
    console.log(`duration: ${this.getDuration}`);
    this.writeToFile();
  }

  async del() {
    console.log("----------------- del start -----------------");
    for (let i = 0; i < this.keyNumbers; i++) {
      await this.exp.del(`${this.prefix}-${i}`);
    }
    console.log("delete done!");
  }

  // write calculated time measurement to a csv file
  writeToFile() {
    const date = new Date();
    const data = `${date.getTime()}, ${this.keyNumbers}, ${this.valueSize}, ${
      this.putDuration
    }, ${this.getDuration}\n`;
    fs.appendFile("timeMeasurement.csv", data, (err) => {
      if (err) throw err;
      console.log("Save done!");
    });
    this.putDuration = 0;
    this.getDuration = 0;
  }

  // generate random string
  randStr = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const charLength = chars.length;
    let result = "";
    for (var i = 0; i < this.valueSize; i++) {
      result += chars.charAt(Math.floor(this.rng() * charLength));
    }
    return result;
  };
}
