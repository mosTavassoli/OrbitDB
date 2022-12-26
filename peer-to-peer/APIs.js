import apiFunctions from "./PerfTest.js";
// import getInputData from "./index.js";

/**
 * @description main function to start the test
 */
const Api = async () => {
  const { put, get, del } = apiFunctions;
  //   const _getInputData = getInputData.getInputData();
  //   if (_getInputData === null) return;
  //   const { keyNumbers } = _getInputData;
  //   for (let keyNumber of keyNumbers) {
  //     for (let i = 0; i < 5; i++) {
  //       await put(keyNumber);
  //       await get(keyNumber);
  //       await del(keyNumber);

  //       // await delCache(keyNumber);
  //     }
  //   }
  // await put(0);
  // const value = await get(0);
  // console.log(value);
  // console.log("done");
};

Api();
