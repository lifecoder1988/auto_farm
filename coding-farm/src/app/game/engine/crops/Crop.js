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
    this.fertilizerReduction = 0;
  }

  applyFertilizer(ms = 2000) {
    this.fertilizerReduction += ms;
  }
  get progress() {
    // 减少的时间不能超过 matureTime * 0.5 （限制最低时间）
    const effectiveMatureTime = Math.max(
      this.matureTime * 0.5,
      this.matureTime - this.fertilizerReduction
    );

    const elapsed = Date.now() - this.plantedAt;

    return Math.min(elapsed / effectiveMatureTime, 1);
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
