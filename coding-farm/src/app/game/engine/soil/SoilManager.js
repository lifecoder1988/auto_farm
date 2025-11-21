// engine/soil.js
import { SoilTile } from "./SoilTile.js";
import * as PIXI from "pixi.js";
export class SoilManager {
  constructor({ mapSize, tileSize, soilLayer, textures }) {
    this.mapSize = mapSize;
    this.tileSize = tileSize;
    this.soilLayer = soilLayer;

    // { soil: Texture, grass: Texture }
    this.textures = textures;

    this.grid = [];
    this.sprites = new Map();

    this._weedTimer = 0;

    this.resetGrid();
    this.initSprites();
  }

  // ---------------------------
  //   Grid 初始化
  // ---------------------------

  resetGrid(type = "grass") {
    this.grid = [];

    for (let y = 0; y < this.mapSize; y++) {
      const row = [];
      for (let x = 0; x < this.mapSize; x++) {
        row.push(new SoilTile(type));
      }
      this.grid.push(row);
    }
  }

  /** 初始化精灵 */
  initSprites() {
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const key = `${x}_${y}`;

        const sprite = new PIXI.Sprite(this.textures.grass);
        sprite.width = this.tileSize;
        sprite.height = this.tileSize;

        sprite.x = x * this.tileSize;
        sprite.y = (this.mapSize - 1 - y) * this.tileSize;

        this.soilLayer.addChild(sprite);
        this.sprites.set(key, sprite);
      }
    }
  }

  // ---------------------------
  //   获取 / 设置土地类型
  // ---------------------------

  getType(x, y) {
    return this.grid?.[y]?.[x]?.type;
  }

  setType(x, y, type) {
    const tile = this.grid[y]?.[x];
    if (!tile) return;

    const sprite = this.sprites.get(`${x}_${y}`);
    if (sprite) {
      sprite.texture = this.textures[type];
    }
  }

  /** 变草地 */
  makeGrass(x, y) {
    const tile = this.grid[y]?.[x];
    if (!tile) return;

    tile.makeGrass();
    this.setType(x, y, "grass");
  }

  /** 变耕地 soil */
  makeSoil(x, y) {
    const tile = this.grid[y]?.[x];
    if (!tile) return;

    tile.makeSoil();
    this.setType(x, y, "soil");
  }

  /** 重置格子 */
  reset(x, y) {
    const tile = this.grid[y]?.[x];
    if (!tile) return;

    tile.reset();
    this.setType(x, y, "soil");
  }

  /** reset 全地图 */
  resetAll() {
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const tile = this.grid[y][x];
        tile.reset();

        const sprite = this.sprites.get(`${x}_${y}`);
        if (sprite) {
          sprite.texture = this.textures.soil;
        }
      }
    }
  }

  // ---------------------------
  //   重建 Layer（世界大小变化）
  // ---------------------------

  resetLayer(mapSize, tileSize) {
    this.mapSize = mapSize;
    this.tileSize = tileSize;

    this.soilLayer.removeChildren();
    this.sprites.clear();

    this.resetGrid();
    this.initSprites();
  }

  /** resize tile 大小 */
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

  // ---------------------------
  //   水分系统
  // ---------------------------

  gridIsWet(x, y, threshold = 0.5) {
    const tile = this.grid?.[y]?.[x];
    if (!tile) return false;
    return tile.waterLevel >= threshold;
  }

  addWater(x, y, amount = 0.2) {
    const tile = this.grid?.[y]?.[x];
    if (!tile) return false;

    tile.addWater(amount);
    return true;
  }

  /** 获取格子水分 */
  getWater(x, y) {
    const tile = this.grid?.[y]?.[x];
    if (!tile) return 0;
    return tile.waterLevel;
  }

  // ---------------------------
  //   杂草系统（仅 soil 生成）
  // ---------------------------

  update(cropManager, { mul }) {
    this._weedTimer += 100;
    if (this._weedTimer < 500) return; // 每 0.5s 做一次
    this._weedTimer = 0;

    // 蒸发
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const tile = this.grid[y][x];
        tile.drainWater(0.001);
      }
    }

    const size = this.mapSize;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const tileType = this.getType(x, y);

        // ❗只有 grass 上才会长杂草
        if (tileType !== "grass") continue;

        // 有作物就不长
        if (cropManager.get(x, y)) continue;

        // 90% 概率非常高，你可以调小
        if (Math.random() < 0.02) {
          cropManager.plantWeed(x, y, mul);
        }
      }
    }
  }
}
