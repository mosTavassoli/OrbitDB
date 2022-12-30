export const Config = {
  repo: "./ipfs/orbitdb-poc-consumer",
  silent: false,
  config: {
    Addresses: {
      Swarm: ["/ip4/0.0.0.0/tcp/4011", "/ip4/0.0.0.0/tcp/4012/ws"],
    },
    Bootstrap: [
      // To establish a connection between the communicating peers for pubsub
      // you need to add it as bootstrapper
      // Note: You can do this dynamically
      // "/ip4/<External IP>/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaC7HZ"
	"/ip4/127.0.0.1/tcp/4001/p2p/QmRZs65q9ESgi7Yf43gLQLymJ54CR28sqkdijdAsxrPo67",
	"/ip4/127.0.0.1/tcp/4002/ws/p2p/QmRZs65q9ESgi7Yf43gLQLymJ54CR28sqkdijdAsxrPo67",
	"/ip4/172.16.203.5/tcp/4001/p2p/QmRZs65q9ESgi7Yf43gLQLymJ54CR28sqkdijdAsxrPo67",
	"/ip4/172.16.203.5/tcp/4002/ws/p2p/QmRZs65q9ESgi7Yf43gLQLymJ54CR28sqkdijdAsxrPo67",

    ],
  },
  Discovery: {
    MDNS: {
      Enabled: false,
      Interval: 10,
    },
  },
  EXPERIMENTAL: {
    pubsub: true,
  },
};

