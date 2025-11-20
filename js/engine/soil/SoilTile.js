// engine/soil/SoilTile.js

export class SoilTile {
  constructor(type = "soil") {
    this.type = type;            // "soil" | "grass"
    this.updatedAt = Date.now();

    this.waterLevel = 0;         // ⭐ 0 ~ 1
  }

  // ----------------
  //   类型判断
  // ----------------
  isSoil() {
    return this.type === "soil";
  }

  isGrass() {
    return this.type === "grass";
  }


  // 将格子变为耕地
  makeSoil() {
    this.type = "soil";
    this.updatedAt = Date.now();
  }

  // 将格子变为草地
  makeGrass() {
    this.type = "grass";
    this.updatedAt = Date.now();
    this.waterLevel = 0;
  }

  // 重置
  reset() {
    this.type = "soil";
    this.updatedAt = Date.now();
    this.waterLevel = 0;
  }

  // ----------------
  //   水分系统
  // ----------------

  setWaterLevel(v) {
    this.waterLevel = Math.max(0, Math.min(1, v));
  }

  addWater(v) {
    this.waterLevel = Math.max(0, Math.min(1, this.waterLevel + v));
  }

  drainWater(v) {
    this.waterLevel = Math.max(0, Math.min(1, this.waterLevel - v));
  }

  isWet() {
    return this.waterLevel > 0.5;
  }
}
