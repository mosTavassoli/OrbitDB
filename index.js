import NewPiecePlease from "./newpieceplease.js";
import * as Ipfs from "ipfs";
import OrbitDB from "orbit-db";
import { CID } from "multiformats/cid";

const hashItems = [
  "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ",
  "QmRn99VSCVdC693F6H4zeS7Dz3UmaiBiSYDf6zCEYrWynq",
  "QmdzDacgJ9EQF9Z8G3L1fzFwiEu255Nm5WiCey9ntrDPSL",
  "QmcFUvG75QTMok9jrteJzBUXeoamJsuRseNuDRupDhFwA2",
  "QmTjszMGLb5gKWAhFZbo8b5LbhCGJkgS8SeeEYq3P54Vih",
  "QmNfQhx3WvJRLMnKP5SucMRXEPy9YQ3V1q9dDWNC6QYMS3",
  "QmQS4QNi8DCceGzKjfmbBhLTRExNboQ8opUd988SLEtZpW",
  "QmcJPfExkBAZe8AVGfYHR7Wx4EW1Btjd5MXX8EnHCkrq54",
  "QmefKrBYeL58qyVAaJoGHXXEgYgsJrxo763gRRqzYHdL6o",
];

const main = async () => {
  try {
    const NPP = new NewPiecePlease(Ipfs, OrbitDB);
    NPP.onready = async () => {
      // ---------------- add item ----------------
      const addCid = await NPP.addNewPiece(
        "QmTjszMGLb5gKWAhFZbo8b5LbhCGJkgS8SeeEYq3P54Vih"
      );
      if (addCid) {
        // solve the issue of getting cid via https://bytemeta.vip/repo/ipfs/js-ipfs/issues/3854
        const content = await NPP.node.dag.get(CID.parse(addCid));
        console.log(content.value.payload);
      }

      // ---------------- delete item by instrument ----------------
      const delCid = await NPP.deletePieceByHash(
        "QmQS4QNi8DCceGzKjfmbBhLTRExNboQ8opUd988SLEtZpW"
      );
      if (delCid) {
        const content = await NPP.node.dag.get(CID.parse(delCid));
        console.log("delete item: ", content.value.payload);
      }

      // ---------------- get item by hash ----------------
      const piece = NPP.getPieceByHash(
        "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ"
      );

      // ---------------- get item by instrument ----------------
      const piecesByInstrument = NPP.getPieceByInstrument("Piano");
      console.log(piecesByInstrument);

      // ---------------- upadte an item ----------------
      const updatePiece = await NPP.updatePieceByHash(
        "QmdzDacgJ9EQF9Z8G3L1fzFwiEu255Nm5WiCey9ntrDPSL",
        "Accordion"
      );

      // ---------------- get all items ----------------
      const allPieces = NPP.getAllPieces();
      // allPieces.forEach((piece) => console.log(piece));
      console.log(allPieces);
    };

    // pieces.forEach((piece) => console.log(piece));
    await NPP.create();
  } catch (error) {
    console.log(error);
  }
};
main();
