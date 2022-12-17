import OrbitDB from "orbit-db";
import API from "./API.js";
import * as Ipfs from "ipfs";
import seedrandom from "seedrandom";
import { EventEmitter } from "events";
// increase the number of listeners. Default is 10, otherwise it will throw a warning
EventEmitter.defaultMaxListeners = 1000;

const main = async () => {
  const rng = seedrandom();
  let keyNumbers = "";
  let valueSize = "";
  if (process.argv.slice(2).length === 0) {
    console.log(
      `Wrong number of arguments, expected 2 arguments, 
      first is the number of Keys, 
      second id size of value`
    );
    return;
  } else {
    keyNumbers = JSON.parse(process.argv.slice(2)[0]);
    valueSize = process.argv.slice(3);
    console.log(`keyNumbers: ${keyNumbers}, valueSize: ${valueSize}`);
  }
  try {
    const api = new API(Ipfs, OrbitDB, keyNumbers, valueSize, rng);
    api.onready = async () => {
      for (let keyNumber of keyNumbers) {
        for (let i = 0; i < 10; i++) {
          api.put(keyNumber);
          await sleep(15000);
          api.get(keyNumber);
          await sleep(15000);
          api.del(keyNumber);
          await sleep(15000);
          // await sleep(3000);
          // console.log("del finished");
          // await sleep(2000);
        }
      }
    };
    await api.create();
  } catch (error) {
    console.log(error);
  }
};

main();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
