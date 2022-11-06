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

    this.user = await this.orbitdb.kvstore("user", this.defaultOptions);
    await this.user.load();
    await this.user.set("pieces", this.pieces.id);

    this.onready();
  }

  async addNewPiece(hash, instrument = "Piano") {
    const existingPiece = this.getPieceByHash(hash);
    if (!existingPiece) {
      const dbName = "counter." + hash.substr(20, 20);
      const counter = await this.orbitdb.counter(dbName, this.defaultOptions);
      const cid = await this.pieces.put({
        hash,
        instrument,
        counter: counter.id,
      });
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
    // console.log(hash, instrument);
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

  async getPracticeCount(piece) {
    const counter = await this.orbitdb.counter(piece.counter);
    await counter.load();
    return counter.value;
  }

  async incPracticeCounter(piece) {
    const counter = await this.orbitdb.counter(piece.counter);
    await counter.load();
    const cid = await counter.inc();
    return cid;
  }

  async delProfileField(key) {
    const cid = await this.user.del(key);
    return cid;
  }

  async getAllProfileField() {
    return this.user.all;
  }

  async getProfileField(key) {
    return this.user.get(key);
  }

  async updateProfileField(key, value) {
    const cid = await this.user.set(key, value);
    return cid;
  }
}
