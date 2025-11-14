// engine/crops/CropManager.js
import { cropsLayer } from '../layers.js';

import { PotatoCrop } from './PotatoCrop.js';
import { PumpkinCrop } from './PumpkinCrop.js';

// 可以随时扩展更多作物：CarrotCrop, PeanutCrop...
const CROP_TYPES = {
  '土豆': new PotatoCrop(),
  '南瓜': new PumpkinCrop(),
};

export class CropManager {
  constructor() {
    // key: "x_y" → { sprite, frameIdx }
    this.cropSprites = new Map();
  }

  draw({ crops, mapSize, tileSize }) {
    const now = Date.now();
    const seen = new Set();

    for (let screenY = 0; screenY < mapSize; screenY++) {
      for (let x = 0; x < mapSize; x++) {
        const ly = mapSize - 1 - screenY; // 世界坐标转 screen 坐标
        const key = `${x}_${ly}`;
        const crop = crops[key];
        if (!crop) continue;

        seen.add(key);

        const renderer = CROP_TYPES[crop.type];
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
