// engine/soil.js
// Soil 系统：动态土壤（normal | tilled） + 自动渲染纹理
import { SoilTile } from "./SoilTile.js";

export class SoilManager {
  constructor({ mapSize, tileSize, soilLayer, textures }) {
    this.mapSize = mapSize;
    this.tileSize = tileSize;
    this.soilLayer = soilLayer;

    // { normal: PIXI.Texture, tilled: PIXI.Texture }
    this.textures = textures;

    this.grid = [];
    // 记录每格土壤类型
    this.resetGrid();

    // PIXI sprites 缓存
    this.sprites = new Map();
    this._weedTimer = 0;
    this.initSprites();
  }

  resetGrid(type = "normal") {
    // 重新生成 grid（全部 normal）
    this.grid = [];
    for (let y = 0; y < this.mapSize; y++) {
      const row = [];
      for (let x = 0; x < this.mapSize; x++) {
        row.push(new SoilTile(type)); // ⭐ 改成对象
      }
      this.grid.push(row);
    }
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
    return this.grid?.[y]?.[x]?.type;
  }

  /** 设置类型，并更新渲染 */
  setType(x, y, type) {
    const tile = this.grid[y]?.[x];
    if (!tile) return;

    tile.setType(type);

    const sprite = this.sprites.get(`${x}_${y}`);
    if (sprite) {
      sprite.texture = this.textures[type];
    }
  }

  /** 耕地：变成 tilled */
  till(x, y) {
    const tile = this.grid[y]?.[x];
    if (!tile) return;

    if (tile.isTilled()) {
      tile.reset();
      this.setType(x, y, "normal");
    } else {
      tile.till();
      this.setType(x, y, "tilled");
    }
  }

  /** 变回 normal */
  reset(x, y) {
    const tile = this.grid[y]?.[x];
    if (!tile) return;
    tile.reset();
    this.setType(x, y, "normal");
  }

  /**
   * 将所有土地重置为 normal
   * （视觉 + grid 数据一起恢复）
   */
  resetAll() {
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const tile = this.grid[y][x];
        tile.reset(); // ⭐ reset SoilTile

        const sprite = this.sprites.get(`${x}_${y}`);
        if (sprite) {
          sprite.texture = this.textures.normal;
        }
      }
    }
  }

  resetLayer(mapSize, tileSize) {
    this.mapSize = mapSize;
    this.tileSize = tileSize;

    this.soilLayer.removeChildren();
    this.sprites.clear();

    // ⭐ 重建 grid
    this.resetGrid();

    // ⭐ 重建 sprite
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
   * 判断 (x,y) 土地是否湿润
   * @param {number} x
   * @param {number} y
   * @param {number} threshold 默认 0.5（大于50%湿度算湿润）
   * @returns {boolean}
   */
  gridIsWet(x, y, threshold = 0.5) {
    const tile = this.grid?.[y]?.[x];
    if (!tile) return false;

    return tile.waterLevel >= threshold;
  }

  /**
   * 给某一格浇水
   * @param {number} x
   * @param {number} y
   * @param {number} amount 增加水量 (0~1)
   * @returns {boolean} 是否成功
   */
  addWater(x, y, amount = 0.2) {
    const tile = this.grid?.[y]?.[x];
    if (!tile) return false;

    tile.addWater(amount)

    return true;
  }

  /**
   * 每帧调用，负责在 normal 土地上随机长杂草
   * @param {number} dt 这一帧经过的毫秒数
   * @param {CropManager} cropManager 用来查询/种杂草
   */
  update(cropManager, { mul }) {
    this._weedTimer += 100;
    // 比如每 500ms 扫一遍，避免每帧都 O(n^2) 太重
    if (this._weedTimer < 500) return;
    this._weedTimer = 0;

    // 每次 update 蒸发一点
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const tile = this.grid[y][x];
        tile.waterLevel = Math.max(0, tile.waterLevel - 0.001);
      }
    }

    console.log("更新杂草");
    const size = this.mapSize;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const type = this.getType(x, y);
        if (type !== "normal") continue;

        // 已经有作物就不长杂草
        const crop = cropManager.get(x, y);
        if (crop) continue;

        // 随机概率长出杂草（可自己调大小）
        if (Math.random() < 0.9) {
          // 90% 概率
          cropManager.plantWeed(x, y, mul); // 你在 CropManager 里实现这个方法
        }
      }
    }
  }
}
