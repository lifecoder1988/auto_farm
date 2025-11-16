export class GameState {
  constructor({
    worldSize = 3,
    viewWidth = 400,
    treasureMultiplier = 1,   // ⭐ 宝藏系数
  } = {}) {

    // 世界配置
    this.world = {
      size: worldSize,
      tileSize: Math.floor(viewWidth / worldSize),
    };

    // 农作物（地图上的作物）
    this.crops = {};   // { "x_y": CropInstance }

    // 游戏模式
    this.mode = "farm"; // or "snake"


  

    // ⭐ 宝藏系数（影响奖励倍数）
    this.treasureMultiplier = Math.max(1, treasureMultiplier);
  }


  // 修改世界大小
  setWorldSize(size, viewWidth) {
    this.world.size = Number(size);
    this.world.tileSize = Math.floor(viewWidth / size);
  }

  // 设置宝藏系数（最小为 1）
  setTreasureMultiplier(v) {
    const val = Number(v);
    if (!Number.isFinite(val)) return;
    this.treasureMultiplier = Math.max(1, val);
  }

  getTreasureMultiplier() {
    return this.treasureMultiplier;
  }

  // 重置农作物
  resetCrops() {
    this.crops = {};
  }

  // 保存到 JSON（用于存档）
  serialize() {
    return JSON.stringify({
      world: this.world,
      crops: this.crops,
      mode: this.mode,
      treasureMultiplier: this.treasureMultiplier,
    });
  }

  // 从存档恢复
  load(data) {
    if (!data) return;

    this.world = data.world || this.world;
    this.crops = data.crops || {};
    this.mode = data.mode || "farm";

    if (data.treasureMultiplier !== undefined) {
      this.treasureMultiplier = Math.max(1, Number(data.treasureMultiplier));
    }
  }
}
