import { entitiesLayer } from './layers.js';

const droneSprites = new Map();

let droneMeta = null;

function getDroneFrames() {

    
  if (droneMeta) return droneMeta;

  const url = "asset/image/drone.png";
  const sheet = PIXI.BaseTexture.from(url);
  console.log("🔍 加载无人机贴图:", sheet.width, sheet.height, sheet.valid);
  const size = 256;

  const buildFrames = () => {
    const frames = [];
    for (let i = 0; i < 4; i++) {
      frames.push(
        new PIXI.Texture(sheet, new PIXI.Rectangle(i * size, 0, size, size))
      );
    }
    droneMeta = { frames, size };
    return droneMeta;
  };

  // 贴图未加载：延迟构建
  if (!sheet.valid) {
    sheet.once("update", () => {
      droneMeta = null; // 强制重新加载
    });

    // 返回占位（透明）
    return { frames: [], size };
  }

  // 贴图已加载
  return buildFrames();
}

export function updateDrones({ entities, mapSize, tileSize }) {

    console.log("🔍 更新无人机:", entities.length);
  const seen = new Set();

  const meta = getDroneFrames();
  const frameSize = meta.size;

  if (!meta.frames.length) {
    // 贴图未加载，不渲染
    return;
  }

  const pad = Math.max(4, tileSize * 0.12);
  const maxSide = Math.max(8, tileSize - pad * 2);
  const scale = Math.min(maxSide / frameSize, 1);

  for (const e of entities) {
    seen.add(e.id);

    let entry = droneSprites.get(e.id);

    // -------- 创建无人机 ----------
    if (!entry) {
      const sprite = new PIXI.AnimatedSprite(meta.frames);
      sprite.anchor.set(0.5, 0.6);
      sprite.animationSpeed = window.DRONE_ANIM_SPEED || 0.25;
      sprite.play();

      if (window.DRONE_KILL_WHITE_FILTER) {
        sprite.filters = [window.DRONE_KILL_WHITE_FILTER];
      }

      const container = new PIXI.Container();
      container.addChild(sprite);

      entitiesLayer.addChild(container);
      entry = { container, sprite };
      droneSprites.set(e.id, entry);
    }

    const { container, sprite } = entry;

    // -------- 平滑移动 ----------
    const targetX = e.x * tileSize + tileSize / 2;
    const targetY = (mapSize - 1 - e.y) * tileSize + tileSize / 2;

    container.x += (targetX - container.x) * 0.25;
    container.y += (targetY - container.y) * 0.25;

    // -------- 平滑缩放 ----------
    sprite.scale.x += (scale - sprite.scale.x) * 0.25;
    sprite.scale.y += (scale - sprite.scale.y) * 0.25;
  }

  // -------- 清理消失 ----------
  for (const [id, entry] of droneSprites.entries()) {
    if (!seen.has(id)) {
      entitiesLayer.removeChild(entry.container);
      droneSprites.delete(id);
    }
  }
}
