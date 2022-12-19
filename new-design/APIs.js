import apiFunctions from "./PerfTest.js";
import getInputData from "./index.js";

// main function to start the test
const Api = async () => {
  const { put, get, del, delCache } = apiFunctions;
  const _getInputData = getInputData.getInputData();
  if (_getInputData === null) return;
  const { keyNumbers } = _getInputData;
  for (let keyNumber of keyNumbers) {
    for (let i = 0; i < 10; i++) {
      await put(keyNumber);
      await get(keyNumber);
      await del(keyNumber);
      // await delCache(keyNumber);
    }
  }
  console.log("done");
};

Api();

// solve the issue of "Nodemon Error: "System limit for number of file watchers reached"
// echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
// https://stackoverflow.com/questions/53930305/nodemon-error-system-limit-for-number-of-file-watchers-reached
