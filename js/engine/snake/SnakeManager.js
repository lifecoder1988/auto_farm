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

  draw(model) {
    if (!model.alive) return;

    this.clear();

    const tile = this.tileSize;
    const world = this.worldSize;

    // ============================
    // ⭐ 渲染蛇身体（屏幕坐标转换）
    // ============================
    for (const seg of model.body) {
      const g = new PIXI.Graphics();

      // 左下角 0,0 → Pixi 左上角 0,0
      const screenY = (world - 1 - seg.y) * tile;

      g.beginFill(this.baseRenderer.bodyColor);
      g.drawRect(seg.x * tile, screenY, tile, tile);
      g.endFill();

      this.bodyLayer.addChild(g);
    }

    // ============================
    // ⭐ 渲染食物
    // ============================
    const f = model.food;
    const fg = new PIXI.Graphics();

    const fy = (world - 1 - f.y) * tile + tile / 2;

    fg.beginFill(this.baseRenderer.foodColor);
    fg.drawCircle(
      f.x * tile + tile / 2, // centerX
      fy,                    // centerY
      tile / 3               // radius
    );
    fg.endFill();

    this.foodLayer.addChild(fg);
  }
}
