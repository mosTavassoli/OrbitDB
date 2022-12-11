export default class Stopwatch {
  constructor() {
    this.clock = 0;
    this.offset = 0;
    this.interval = null;
  }

  start() {
    console.log("start");
    this.offset = Date.now();
    this.interval = setInterval(() => this.update(), 1);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    return this.clock / 1000;
  }

  reset() {
    this.clock = 0;
  }

  update() {
    this.clock += this.delta();
  }

  delta() {
    const now = Date.now(),
      d = now - this.offset;
    this.offset = now;
    return d;
  }
}
