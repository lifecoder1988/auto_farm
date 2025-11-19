// engine/crops/CropManager.js
import { cropsLayer } from "../layers.js";

import { PotatoCrop } from "./PotatoCrop.js";
import { PumpkinCrop } from "./PumpkinCrop.js";
import { HayCrop } from "./HayCrop.js";
import { BushCrop } from "./BushCrop.js";
import { CarrotCrop } from "./CarrotCrop.js";
import { TreeCrop } from "./TreeCrop.js";
import { CactusCrop } from "./CactusCrop.js";
import { SunFlowerCrop } from "./SunFlowerCrop.js";
import { Crop } from "./Crop.js";

import { CropEventBus } from "./CropEventBus.js";

export const CROP_TYPES = {
  土豆: {
    time: 3000,
    item: "potato",
    renderer: new PotatoCrop(),
  },

  花生: {
    time: 5000,
    item: "peanut",
    renderer: null, // 还没做 PeanutCrop，可以先留空
  },

  南瓜: {
    time: 7000,
    item: "pumpkin",
    renderer: new PumpkinCrop(),
  },

  草: {
    time: 0,
    item: "hay",
    renderer: new HayCrop(),
  },
  灌木丛: {
    time: 0,
    item: "wood",
    renderer: new BushCrop(),
  },
  胡萝卜: {
    time: 0,
    item: "carrot",
    renderer: new CarrotCrop(),
    cost: { hay: 512, wood: 512 },
  },
  树: {
    time: 0,
    item: "wood",
    renderer: new TreeCrop(),
  },
  仙人掌: {
    time: 0,
    item: "cactus",
    renderer: new CactusCrop(),
    cost: { pumpkin: 64 },
  },
  向日葵: {
    time: 0,
    item: "sunflower",
    renderer: new SunFlowerCrop(),
    cost: { carrot: 1 },
  },
};

export class CropManager {
  constructor() {
    // key: "x_y" → { sprite, frameIdx }
    this.cropSprites = new Map();
    this.crops = {};
  }

  applyMergeArea({ x, y, n }) {
    for (let ix = 0; ix < n; ix++) {
      for (let iy = 0; iy < n; iy++) {
        const crop = this.get(x + ix, y + iy);
        if (crop) {
          crop.mergeArea = { x, y, n }; // 左上角 + 边长
        }
      }
    }
  }
  key(x, y) {
    return `${x}_${y}`;
  }

  get(x, y) {
    return this.crops[this.key(x, y)];
  }

  exist(x, y) {
    return !!this.get(x, y);
  }

  set(crop) {
    this.crops[crop.key] = crop;
  }

  delete(x, y) {
    delete this.crops[this.key(x, y)];
  }

  all() {
    return this.crops;
  }

  reset() {
    this.crops = {};
  }

  applyFertilizer(x, y, ms = 2000) {
    const crop = this.get(x, y);
    if (!crop) return false;

    crop.applyFertilizer(ms);
    return true;  
  }

  /**
   * 种杂草
   * @param {number} x 坐标
   * @param {number} y 坐标
   */
  plantWeed(x, y, mul) {
    const key = this.key(x, y);
    if (this.exist(x, y)) {
      console.warn("已种有作物，无法种杂草:", key);
      return;
    }

    const weedCrop = new Crop({
      type: "草",
      key: `${x}_${y}`,
      plantedAt: Date.now(),
      matureTime: 0,
    });
    weedCrop.setYieldMultiplier(mul);

    this.set(weedCrop);
    //CropEventBus.emit("cropPlanted", weedCrop);
  }

  updateCrops() {
    for (const key in this.crops) {
      const crop = this.crops[key];
      if (crop && typeof crop.checkMature === "function") {
        crop.checkMature();
      }
    }
  }

  updateConfig(mapSize, tileSize) {
    this.mapSize = mapSize;
    this.tileSize = tileSize;
  }
  draw({ mapSize, tileSize }) {
    const now = Date.now();
    const seen = new Set();

    for (let screenY = 0; screenY < mapSize; screenY++) {
      for (let x = 0; x < mapSize; x++) {
        const ly = mapSize - 1 - screenY; // 世界坐标转 screen 坐标
        const key = `${x}_${ly}`;
        const crop = this.crops[key];
        if (!crop) continue;

        seen.add(key);

        const renderer = CROP_TYPES[crop.type].renderer;
        if (!renderer) {
          console.warn("未知作物类型:", crop.type);
          continue;
        }

        renderer.render({
          crop,
          key,
          x,
          screenY,
          tileSize,
          now,
          store: this.cropSprites,
        });
      }
    }

    // 清理消失的作物
    for (const [key, entry] of this.cropSprites.entries()) {
      if (!seen.has(key)) {
        cropsLayer.removeChild(entry.sprite);
        this.cropSprites.delete(key);
      }
    }
  }
}
