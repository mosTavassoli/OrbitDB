import * as Ipfs from "ipfs";

const node = await Ipfs.create();
const data = "Hello, My Name is Mostafa Tavassoli";
const result = node.add(data);
const cid = await result.then((res) => {
  return res.cid;
});

console.log(cid); // QmWXxBhZnHeBM4RxU7G6wgxvGCU5mqat8ZqmzuZPLHuwwg

const stream = node.cat(cid);
const decoder = new TextDecoder();
let decodedData = "";
for await (const chunk of stream) {
  (decodedData += decoder.decode(chunk)), { stream: true };
}
console.log(decodedData); // Hello, My Name is Mostafa Tavassoli
