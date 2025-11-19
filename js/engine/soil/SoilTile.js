// engine/soil/SoilTile.js

export class SoilTile {
  constructor(type = "normal") {
    this.type = type; // "normal" | "tilled"
    this.updatedAt = Date.now();
  }

  isTilled() {
    return this.type === "tilled";
  }

  till() {
    this.type = "tilled";
    this.updatedAt = Date.now();
  }

  reset() {
    this.type = "normal";
    this.updatedAt = Date.now();
  }
}
