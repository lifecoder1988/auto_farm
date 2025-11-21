// engine/snake/SnakeManager.js

export class SnakeManager {
  constructor(app, baseRenderer, tileSize, worldSize) {
    this.app = app;
    this.baseRenderer = baseRenderer;

    this.tileSize = tileSize;
    this.worldSize = worldSize;

    this.bodyLayer = new PIXI.Container();
    this.foodLayer = new PIXI.Container();

    // 贴图偏移（根据你提供的素材朝向）
    this.HEAD_BASE_ROT = Math.PI / 2; // 头默认朝下 → 转成朝右
    this.BODY_BASE_ROT = 0; // 身体默认朝右 → 无偏移
    this.TAIL_BASE_ROT = Math.PI / 2; // 尾默认朝上 → 转成朝右

    app.stage.addChild(this.bodyLayer);
    app.stage.addChild(this.foodLayer);
  }

  updateConfig(tileSize, worldSize) {
    this.tileSize = tileSize;
    this.worldSize = worldSize;
  }

  clear() {
    this.bodyLayer.removeChildren();
    this.foodLayer.removeChildren();
  }

  destroy() {
    this.clear();
    if (this.bodyLayer.parent)
      this.bodyLayer.parent.removeChild(this.bodyLayer);
    if (this.foodLayer.parent)
      this.foodLayer.parent.removeChild(this.foodLayer);

    this.bodyLayer.destroy({ children: true });
    this.foodLayer.destroy({ children: true });
  }

  /** 统一方向计算（头/身体/尾都用这一套） */
  _computeSegmentAngle(body, index) {
    const len = body.length;
    const cur = body[index];

    if (len === 1) {
      return 0;
    }
    let dx, dy;

    if (index === 0) {
      // 头 → 朝向下一段
      const next = body[1];
      dx = next.x - cur.x;
      dy = next.y - cur.y;
    } else {
      // 所有其他段 → 朝向上一段（更靠头）
      const prev = body[index - 1];
      dx = cur.x - prev.x;
      dy = cur.y - prev.y;
    }

    // (0,0) 在左下 → 屏幕 y 轴向下 → dy 要取反
    return Math.atan2(-dy, dx);
  }

  draw(model) {
    if (!model.alive) return;

    this.clear();

    const body = model.body;
    const tile = this.tileSize;
    const worldSize = this.worldSize;

    for (let i = 0; i < body.length; i++) {
      const seg = body[i];

      let tex = this.baseRenderer.bodyTexture;
      let baseRot = this.BODY_BASE_ROT;

      if (i === 0) {
        tex = this.baseRenderer.headTexture;
        baseRot = this.HEAD_BASE_ROT;
      } else if (i === body.length - 1) {
        tex = this.baseRenderer.tailTexture;
        baseRot = this.TAIL_BASE_ROT;
      }

      const sprite = new PIXI.Sprite(tex);
      sprite.anchor.set(0.5);

      const screenX = seg.x * tile + tile / 2;
      const screenY = (worldSize - 1 - seg.y) * tile + tile / 2;
      sprite.x = screenX;
      sprite.y = screenY;

      const angle = this._computeSegmentAngle(body, i);
      sprite.rotation = angle + baseRot; // 最终旋转 = 朝向角度 + 贴图偏移

      // 缩放
      const scale = (tile / sprite.texture.height) * this.baseRenderer.scale;
      sprite.scale.set(scale);

      this.bodyLayer.addChild(sprite);
    }

    // 食物渲染（你的逻辑是 OK 的）
    const f = model.food;
    if (f && this.baseRenderer.appleTexture) {
      const apple = new PIXI.Sprite(this.baseRenderer.appleTexture);
      apple.anchor.set(0.5);

      apple.x = f.x * tile + tile / 2;
      apple.y = (worldSize - 1 - f.y) * tile + tile / 2;

      const scale = (tile / apple.texture.height) * 0.8;
      apple.scale.set(scale);

      this.foodLayer.addChild(apple);
    }
  }
}
