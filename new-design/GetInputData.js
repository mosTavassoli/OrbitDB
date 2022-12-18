const GetInputData = () => {
  let keyNumbers = "";
  let valueSize = "";
  if (process.argv.slice(2).length === 0) {
    console.log(
      `Wrong number of arguments, expected 2 arguments, 
        first is the number of Keys, 
        second id size of value`
    );
    return null;
  } else {
    keyNumbers = JSON.parse(process.argv.slice(2)[0]);
    valueSize = process.argv.slice(3);
    console.log(`keyNumbers: ${keyNumbers}, valueSize: ${valueSize}`);
    return { keyNumbers, valueSize };
  }
};

export default GetInputData;
