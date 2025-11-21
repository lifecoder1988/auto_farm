// engine/crops.js
import { cropsLayer } from './layers.js';
import { getPotatoFramesMeta } from './potato.js';
import { smooth, smoothScale, tweenAlpha, tweenScale } from '../utils/tween.js';

const cropSprites = new Map();

export function drawCrops({ crops, mapSize, tileSize }) {
  const now = Date.now();
  const seen = new Set();

  for (let screenY = 0; screenY < mapSize; screenY++) {
    for (let x = 0; x < mapSize; x++) {
      const ly = mapSize - 1 - screenY;
      const key = `${x}_${ly}`;
      const crop = crops[key];
      if (!crop) continue;
      seen.add(key);

      if (crop.type === '土豆') {
        renderPotato(crop, key, x, screenY, tileSize, now);
      } else {
        // TODO: 其它作物的画法，先省略或用 Graphics
      }
    }
  }

  for (const [key, entry] of cropSprites.entries()) {
    if (!seen.has(key)) {
      cropsLayer.removeChild(entry.sprite);
      cropSprites.delete(key);
    }
  }
}

function renderPotato(crop, key, x, screenY, tileSize, now) {
  const meta = getPotatoFramesMeta();
  const elapsed = now - crop.plantedAt;
  const progress = Math.min(elapsed / crop.matureTime, 1);
  const newIdx = Math.min(meta.frames.length - 1, Math.floor(progress * meta.frames.length));

  const pad = Math.max(6, tileSize * 0.12);
  const maxSide = Math.max(8, tileSize - pad * 2);
  const targetScale = Math.min(maxSide / (meta.size || 256), 1);

  const offsetY = tileSize * 0.15;
  const targetX = Math.round(x * tileSize + tileSize / 2);
  const targetY = Math.round(screenY * tileSize + tileSize - offsetY);

  let entry = cropSprites.get(key);

  if (!entry) {
    const sprite = new PIXI.Sprite(meta.frames[newIdx]);
    sprite.anchor.set(0.5, 1);
    sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    sprite.x = targetX;
    sprite.y = targetY;
    sprite.alpha = 0;
    sprite.scale.set(targetScale * 0.85);
    cropsLayer.addChild(sprite);

    cropSprites.set(key, { sprite, frameIdx: newIdx });

    tweenAlpha(sprite, 1, 150);
    tweenScale(sprite, targetScale, 200);
    return;
  }

  const sprite = entry.sprite;

  if (entry.frameIdx !== newIdx) {
    tweenAlpha(sprite, 0, 150);
    setTimeout(() => cropsLayer.removeChild(sprite), 150);

    const newSprite = new PIXI.Sprite(meta.frames[newIdx]);
    newSprite.anchor.set(0.5, 1);
    newSprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    newSprite.x = targetX;
    newSprite.y = targetY;
    newSprite.alpha = 0;
    newSprite.scale.set(targetScale * 0.85);
    cropsLayer.addChild(newSprite);

    cropSprites.set(key, { sprite: newSprite, frameIdx: newIdx });

    tweenAlpha(newSprite, 1, 150);
    tweenScale(newSprite, targetScale, 200);
  } else {
    smooth(sprite, 'x', targetX);
    smooth(sprite, 'y', targetY);
    smoothScale(sprite, targetScale);
  }
}
