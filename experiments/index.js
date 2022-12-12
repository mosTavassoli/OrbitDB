import OrbitDB from "orbit-db";
import API from "./API.js";
import * as Ipfs from "ipfs";
import seedrandom from "seedrandom";

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
    keyNumbers = process.argv.slice(2)[0];
    valueSize = process.argv.slice(2)[1];
    console.log(`keyNumbers: ${keyNumbers}, valueSize: ${valueSize}`);
  }
  try {
    const api = new API(Ipfs, OrbitDB, keyNumbers, valueSize, rng);
    api.onready = async () => {
      await api.createFile();
      await api.put();
      await sleep(2000);
      await api.get();
      await sleep(2000);
      await api.del();
    };

    await api.create();
  } catch (error) {
    console.log(error);
  }
};

// Sleep function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
