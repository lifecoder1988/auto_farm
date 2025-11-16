// engine/snake/SnakeManager.js

export class SnakeManager {
  constructor(app, baseRenderer, tileSize, worldSize) {
    this.app = app;
    this.baseRenderer = baseRenderer;

    this.tileSize = tileSize;
    this.worldSize = worldSize;

    this.bodyLayer = new PIXI.Container();
    this.foodLayer = new PIXI.Container();

    app.stage.addChild(this.bodyLayer);
    app.stage.addChild(this.foodLayer);
  }

  /** 世界或 tileSize 改变时更新配置 */
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

    if (this.bodyLayer.parent) {
      this.bodyLayer.parent.removeChild(this.bodyLayer);
    }
    if (this.foodLayer.parent) {
      this.foodLayer.parent.removeChild(this.foodLayer);
    }

    this.bodyLayer.destroy({ children: true });
    this.foodLayer.destroy({ children: true });
  }


  /**
   * 根据前后段坐标，计算这一节蛇的朝向（弧度）
   */
  _computeSegmentAngle(body, index) {
    const cur = body[index];
    const prev = body[index - 1];
    const next = body[index + 1];

    // 头：参考下一节
    if (index === 0 && next) {
      return this._angleFromDelta(next.x - cur.x, next.y - cur.y);
    }

    // 尾：参考上一节
    if (index === body.length - 1 && prev) {
      return this._angleFromDelta(cur.x - prev.x, cur.y - prev.y);
    }

    // 中间：尽量沿着前→后方向
    if (prev && next) {
      return this._angleFromDelta(next.x - prev.x, next.y - prev.y);
    }

    return 0;
  }

  _angleFromDelta(dx, dy) {
    // 注意：棋盘 y 往上是正，但屏幕坐标系 y 往下是正，所以要翻一下
    if (dx === 1 && dy === 0) return 0;                // 朝右
    if (dx === -1 && dy === 0) return Math.PI;         // 朝左
    if (dx === 0 && dy === 1) return -Math.PI / 2;     // 朝上（棋盘）→ 屏幕向上
    if (dx === 0 && dy === -1) return Math.PI / 2;     // 朝下
    return 0;
  }
  // SnakeManager.js
  draw(model) {



    if (!model.alive) return;

    this.clear();

    const body = model.body;
    const tile = this.tileSize;
    const worldSize = this.worldSize;

    for (let i = 0; i < body.length; i++) {
      const seg = body[i];

      // 选择纹理来自 SnakeBase
      let tex = this.baseRenderer.bodyTexture;
      if (i === 0) tex = this.baseRenderer.headTexture;
      else if (i === body.length - 1)
        tex = this.baseRenderer.tailTexture;

      const sprite = new PIXI.Sprite(tex);
      sprite.anchor.set(0.5);

      const screenX = seg.x * tile + tile / 2;
      const screenY = (worldSize - 1 - seg.y) * tile + tile / 2;

      sprite.x = screenX;
      sprite.y = screenY;

      const angle = this._computeSegmentAngle(body, i);
      sprite.rotation = angle;

      const scale = (tile / sprite.texture.height) * this.baseRenderer.scale;
      sprite.scale.set(scale);

      this.bodyLayer.addChild(sprite);
    }

    const f = model.food;
    if (f && this.baseRenderer.appleTexture) {

      const apple = new PIXI.Sprite(this.baseRenderer.appleTexture);
      apple.anchor.set(0.5);

      const screenX = f.x * tile + tile / 2;
      const screenY = (worldSize - 1 - f.y) * tile + tile / 2;

      apple.x = screenX;
      apple.y = screenY;

      // 自动缩放（保持纹理比例）
      const base = apple.texture.baseTexture;
      const scale = (tile / base.height) * 0.8; // 80%大小比较好看
      apple.scale.set(scale);

      this.foodLayer.addChild(apple);
    }
  }

}
