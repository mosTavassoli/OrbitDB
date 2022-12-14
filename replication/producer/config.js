export const Config = {
  repo: "./ipfs/orbitdb-poc-producer",
  silent: false,
  config: {
    Addresses: {
      Swarm: ["/ip4/0.0.0.0/tcp/4001", "/ip4/0.0.0.0/tcp/4002/ws"],
    },
    Bootstrap: [
      // To establish a connection between the communicating peers for pubsub
      // you need to add it as bootstrapper
      "/ip4/127.0.0.1/tcp/4011/p2p/QmckaRMbvgaTCPQuLTRXRS79iQkKpVY3wFG1B2kZ8P86NE",
      "/ip4/127.0.0.1/tcp/4012/ws/p2p/QmckaRMbvgaTCPQuLTRXRS79iQkKpVY3wFG1B2kZ8P86NE",
      "/ip4/172.16.226.132/tcp/4011/p2p/QmckaRMbvgaTCPQuLTRXRS79iQkKpVY3wFG1B2kZ8P86NE",
      "/ip4/172.16.226.132/tcp/4012/ws/p2p/QmckaRMbvgaTCPQuLTRXRS79iQkKpVY3wFG1B2kZ8P86NE",
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
