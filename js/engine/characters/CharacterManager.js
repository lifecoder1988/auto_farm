import { Drone } from './Drone.js';
import { Dino } from './Dino.js';

import { entitiesLayer } from '../layers.js';

// 注册所有可用角色类型
const CHARACTER_CLASSES = {
  drone: Drone,
  dino: Dino,
};

export class CharacterManager {
  constructor() {
    this.instances = new Map();    // id -> Character 实例
    this.textureCache = new Map(); // type -> { frames, size }
  }

  getTextures(Class) {
    if (this.textureCache.has(Class)) {
      return this.textureCache.get(Class);
    }

    const sheet = PIXI.BaseTexture.from(Class.url);

    const build = () => {
      const frames = [];
      for (let i = 0; i < Class.frames; i++) {
        frames.push(
          new PIXI.Texture(sheet, new PIXI.Rectangle(i * Class.size, 0, Class.size, Class.size))
        );
      }
      const meta = { frames, size: Class.size };
      this.textureCache.set(Class, meta);
      return meta;
    };

    if (!sheet.valid) {
      sheet.once("update", () => {
        this.textureCache.delete(Class);
      });
      return { frames: [], size: Class.size };
    }

    return build();
  }

  update(entities, mapSize, tileSize) {
    const seen = new Set();

    for (const e of entities) {
      const Class = CHARACTER_CLASSES[e.type];
      if (!Class) continue;

      seen.add(e.id);

      let inst = this.instances.get(e.id);

      // 若实体类型发生变化，销毁旧实例以便重建
      if (inst && inst.type !== e.type) {
        inst.destroy(entitiesLayer);
        this.instances.delete(e.id);
        inst = null;
      }

      // ---- 创建实例 ----
      if (!inst) {
        const meta = this.getTextures(Class);
        if (!meta.frames.length) continue;

        inst = new Class(e, meta, entitiesLayer);
        this.instances.set(e.id, inst);
      }

      inst.update(e, mapSize, tileSize);
    }

    // ---- 清理消失的 ----
    for (const [id, inst] of this.instances) {
      if (!seen.has(id)) {
        inst.destroy(entitiesLayer);
        this.instances.delete(id);
      }
    }
  }
}
