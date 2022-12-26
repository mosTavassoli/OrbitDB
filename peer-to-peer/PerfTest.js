import data from "./connection.js";

const db = data.dbConnection;
const conncetion = await db();

const put = async (keyNumber) => {
  await conncetion.put(`key-${keyNumber}`, { value: "value" });
};

const get = async (keyNumber) => {
  const value = await conncetion.get(`key-${keyNumber}`);
  // console.log(value);
  return value;
};

const apiFunctions = {
  put,
  get,
};

export default apiFunctions;
