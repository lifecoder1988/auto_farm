// engine/crops/Crop.js
import { CropEventBus } from "./CropEventBus.js";

export class Crop {
  constructor({ type, plantedAt, matureTime, key, baseYield = 1 }) {
    this.type = type;
    this.key = key; // ⭐ 增加 key，知道自己坐标（非常重要）
    this.plantedAt = plantedAt;
    this.matureTime = matureTime;

    this.baseYield = baseYield;
    this.yieldMultiplier = 1;

    this._lastMature = false;
    this.onMature = null; // 单作物回调（可选）
    this.mergeArea = null;
  }

  get progress() {
    const p = (Date.now() - this.plantedAt) / this.matureTime;
    return Math.min(p, 1);
  }

  get isMature() {
    return this.progress >= 1;
  }

  // ⭐ 设置产量倍率
  setYieldMultiplier(mult) {
    this.yieldMultiplier = mult;
  }

  // ⭐ 计算最终产量
  get finalYield() {
    return Math.round(this.baseYield * this.yieldMultiplier);
  }
  checkMature() {
    if (!this._lastMature && this.isMature) {
      this._lastMature = true;

      // 自身回调
      if (this.onMature) this.onMature(this);

      // ⭐ 全局广播
      CropEventBus.broadcast("crop:mature", this, this.key);
    }
  }
}
