import apiFunctions from "./PerfTest.js";
import getInputData from "./index.js";

const Api = async () => {
  const { put, get, del } = apiFunctions;
  const _getInputData = getInputData.getInputData();
  if (_getInputData === null) return;
  const { keyNumbers } = _getInputData;
  for (let keyNumber of keyNumbers) {
    for (let i = 0; i < 10; i++) {
      await put(keyNumber);
      get(keyNumber);
      await del(keyNumber);
    }
  }
};

Api();
