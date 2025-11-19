// engine/soil.js
// Soil 系统：动态土壤（normal | tilled） + 自动渲染纹理

export class SoilManager {
  constructor({ mapSize, tileSize, soilLayer, textures }) {
    this.mapSize = mapSize;
    this.tileSize = tileSize;
    this.soilLayer = soilLayer;

    // { normal: PIXI.Texture, tilled: PIXI.Texture }
    this.textures = textures;

    // 记录每格土壤类型
    this.grid = [];
    for (let y = 0; y < mapSize; y++) {
      const row = [];
      for (let x = 0; x < mapSize; x++) {
        row.push("normal");   // 默认全部 normal
      }
      this.grid.push(row);
    }

    // PIXI sprites 缓存
    this.sprites = new Map();
    this._weedTimer = 0;
    this.initSprites();
  }

  /** 初始化：每格一个 sprite，不重建 */
  initSprites() {
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const key = `${x}_${y}`;
        const sprite = new PIXI.Sprite(this.textures.normal);

        sprite.width = this.tileSize;
        sprite.height = this.tileSize;

        sprite.x = x * this.tileSize;
        sprite.y = (this.mapSize - 1 - y) * this.tileSize;

        this.soilLayer.addChild(sprite);
        this.sprites.set(key, sprite);
      }
    }
  }

  /** 获取当前类型 */
  getType(x, y) {
    return this.grid?.[y]?.[x];
  }

  /** 设置类型，并更新渲染 */
  setType(x, y, type) {
    if (type !== "normal" && type !== "tilled") return;

    this.grid[y][x] = type;

    const sprite = this.sprites.get(`${x}_${y}`);
    if (sprite) {
      sprite.texture = this.textures[type];
    }
  }

  /** 耕地：变成 tilled */
  till(x, y) {
    if (this.getType(x, y) === "tilled") {
        this.setType(x, y, "normal");
    } else {
        this.setType(x, y, "tilled");
    }
    
  }

  /** 变回 normal */
  reset(x, y) {
    this.setType(x, y, "normal");
  }

  /** 改变 tile size 时重算所有 sprite 的位置和大小 */
  resize(newTileSize) {
    this.tileSize = newTileSize;

    for (const [key, sprite] of this.sprites.entries()) {
      const [x, y] = key.split("_").map(Number);

      sprite.width = newTileSize;
      sprite.height = newTileSize;

      sprite.x = x * newTileSize;
      sprite.y = (this.mapSize - 1 - y) * newTileSize;
    }
  }

    /**
   * 每帧调用，负责在 normal 土地上随机长杂草
   * @param {number} dt 这一帧经过的毫秒数
   * @param {CropManager} cropManager 用来查询/种杂草
   */
  update( cropManager,{mul}) {
    this._weedTimer += 100;
    // 比如每 500ms 扫一遍，避免每帧都 O(n^2) 太重
    if (this._weedTimer < 500) return;
    this._weedTimer = 0;

    const size = this.mapSize;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const type = this.getType(x, y);
        if (type !== "normal") continue;

        // 已经有作物就不长杂草
        const crop = cropManager.get(x, y);
        if (crop) continue;

        // 随机概率长出杂草（可自己调大小）
        if (Math.random() < 0.9) { // 90% 概率
          cropManager.plantWeed(x, y,mul); // 你在 CropManager 里实现这个方法
        }
      }
    }
  }
}
