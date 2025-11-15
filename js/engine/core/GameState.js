export class GameState {
  constructor({
    worldSize = 3,
    viewWidth = 400,
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

    // 未来可以在这添加更多全局状态
    // this.day = 1;
    // this.weather = "sunny";
    // this.randomSeed = 123;
  }

  // 修改世界大小
  setWorldSize(size, viewWidth) {
    this.world.size = Number(size);
    this.world.tileSize = Math.floor(viewWidth / size);
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
      mode: this.mode
    });
  }

  // 从存档恢复
  load(data) {
    if (!data) return;
    this.world = data.world || this.world;
    this.crops = data.crops || {};
    this.mode = data.mode || "farm";
  }
}
