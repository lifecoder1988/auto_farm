// engine/soil/SoilTile.js

export class SoilTile {
  constructor(type = "normal") {
    this.type = type;                 // "normal" | "tilled"
    this.updatedAt = Date.now();

    this.waterLevel = 0;              // ⭐ 土地含水量：0 - 1
  }

  // ----------------
  //   土地类型相关
  // ----------------
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
    this.waterLevel = 0;             // ⭐ 重置时土壤水分也清空
  }

  // ----------------
  //   含水量相关
  // ----------------

  /** 直接设置水量（自动 clamp 0~1） */
  setWaterLevel(v) {
    this.waterLevel = Math.max(0, Math.min(1, v));
  }

  /** 增加水量（自动 clamp 0~1） */
  addWater(v) {
    this.waterLevel = Math.max(0, Math.min(1, this.waterLevel + v));
  }

  /** 减少水量（蒸发/干燥） */
  drainWater(v) {
    this.waterLevel = Math.max(0, Math.min(1, this.waterLevel - v));
  }

  /** 是否湿润（常用于增快生长） */
  isWet() {
    return this.waterLevel > 0.5; // 或者 > 0.3，可配置
  }
}
