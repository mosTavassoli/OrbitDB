import OrbitDB from "orbit-db";
import API from "./API.js";
import * as Ipfs from "ipfs";

const main = async () => {
  let keyNumbers = "";
  let valueSize = "";
  let totalSize = "";
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
    totalSize = keyNumbers * valueSize;
    console.log(`keyNumbers: ${keyNumbers}, valueSize: ${valueSize}`);
  }
  try {
    const api = new API(Ipfs, OrbitDB);
    api.onready = async () => {
      await api.put(keyNumbers, valueSize);
    };

    await api.create();
  } catch (error) {
    console.log(error);
  }
};

main();
