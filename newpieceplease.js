export default class NewPiecePlease {
  constructor(Ipfs, OrbitDB) {
    this.OrbitDB = OrbitDB;
    this.Ipfs = Ipfs;
  }

  async create() {
    this.node = await this.Ipfs.create({
      preload: { enabled: false },
      repo: "./ipfs",
      EXPERIMENTAL: { pubsub: true },
      config: {
        Bootstrap: [],
        Addresses: { Swarm: [] },
      },
    });

    await this._init();
  }

  async _init() {
    this.orbitdb = await this.OrbitDB.createInstance(this.node);
    this.defaultOptions = {
      accessController: {
        write: [this.orbitdb.identity.id],
      },
    };

    const docStoreOptions = {
      ...this.defaultOptions,
      indexBy: "hash",
    };
    this.pieces = await this.orbitdb.docstore("pieces", docStoreOptions);
    await this.pieces.load();
    this.onready();
  }

  async addNewPiece(hash, instrument = "Piano") {
    const existingPiece = this.getPieceByHash(hash);
    if (!existingPiece) {
      const cid = await this.pieces.put({ hash, instrument });
      return cid;
    } else {
      return await this.updatePieceByHash(hash, instrument);
    }
  }

  getAllPieces() {
    const pieces = this.pieces.get("");
    return pieces;
  }

  getPieceByHash(hash) {
    const singlePiece = this.pieces.get(hash)[0];
    return singlePiece;
  }

  getPieceByInstrument(instrument) {
    return this.pieces.query((piece) => piece.instrument === instrument);
  }

  async updatePieceByHash(hash, instrument = "Piano") {
    console.log(hash, instrument);
    const piece = await this.getPieceByHash(hash);
    if (piece) {
      piece.instrument = instrument;
      const cid = await this.pieces.put(piece);
      return cid;
    }
    return null;
  }

  async deletePieceByHash(hash) {
    const piece = await this.getPieceByHash(hash);
    if (piece) {
      const cid = await this.pieces.del(hash);
      return cid;
    }
    return null;
  }
}
