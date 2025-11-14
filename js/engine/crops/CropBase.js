// engine/crops/CropBase.js
import { cropsLayer } from '../layers.js';
import { smooth, smoothScale, tweenAlpha, tweenScale } from '../../utils/tween.js';

export class CropBase {
  constructor({ url, size = 256, frames = 4 }) {
    this.url = url;
    this.size = size;
    this.frameCount = frames;

    this._meta = null;      // cache
    this._loading = false;  // 避免重复 load
  }

  // 子类 override：如 "土豆"
  get type() {
    return "Unknown";
  }

  // ⭐ 获取帧图，自动 lazy-load & 缓存
  getFramesMeta() {
    if (this._meta) return this._meta;

    const sheet = PIXI.BaseTexture.from(this.url);

    const build = () => {
      const arr = [];
      for (let i = 0; i < this.frameCount; i++) {
        arr.push(
          new PIXI.Texture(
            sheet,
            new PIXI.Rectangle(i * this.size, 0, this.size, this.size)
          )
        );
      }
      this._meta = {
        frames: arr,
        size: this.size,
      };
      return this._meta;
    };

    // 图片可能没加载完
    if (!sheet.valid) {
      if (!this._loading) {
        this._loading = true;
        sheet.once("update", () => {
          this._meta = null; // 强制刷新
          this._loading = false;
        });
      }
      return { frames: [], size: this.size };
    }

    return build();
  }

  getFrameIndex(progress) {
    const meta = this.getFramesMeta();
    return Math.min(meta.frames.length - 1, Math.floor(progress * meta.frames.length));
  }

  // ⭐ 这个方法被 CropManager 调用
  render({ crop, key, x, screenY, tileSize, now, store }) {
    const meta = this.getFramesMeta();
    if (!meta.frames.length) return;  // 图未加载时跳过

    const elapsed = now - crop.plantedAt;
    const progress = Math.min(elapsed / crop.matureTime, 1);
    const newIdx = this.getFrameIndex(progress);

    const pad = Math.max(6, tileSize * 0.12);
    const maxSide = Math.max(8, tileSize - pad * 2);
    const targetScale = Math.min(maxSide / meta.size, 1);

    const offsetY = tileSize * 0.15;
    const targetX = Math.round(x * tileSize + tileSize / 2);
    const targetY = Math.round(screenY * tileSize + tileSize - offsetY);

    let entry = store.get(key);

    // 初始化
    if (!entry) {
      const sprite = new PIXI.Sprite(meta.frames[newIdx]);
      sprite.anchor.set(0.5, 1);
      sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      sprite.x = targetX;
      sprite.y = targetY;
      sprite.alpha = 0;
      sprite.scale.set(targetScale * 0.85);

      cropsLayer.addChild(sprite);
      store.set(key, { sprite, frameIdx: newIdx });

      tweenAlpha(sprite, 1, 150);
      tweenScale(sprite, targetScale, 200);
      return;
    }

    const sprite = entry.sprite;

    // 换帧
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
      store.set(key, { sprite: newSprite, frameIdx: newIdx });

      tweenAlpha(newSprite, 1, 150);
      tweenScale(newSprite, targetScale, 200);
    } else {
      smooth(sprite, 'x', targetX);
      smooth(sprite, 'y', targetY);
      smoothScale(sprite, targetScale);
    }
  }
}
