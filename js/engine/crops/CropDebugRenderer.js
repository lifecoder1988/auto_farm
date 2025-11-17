export class CropDebugRenderer {
  constructor(app) {
    this.app = app;
  }

  clear() {
    this.app.layers.debugLayer.clear();
  }

  drawSquares(areas) {
    const g = this.app.layers.debugLayer;
    g.clear();

    const tile = this.app.gameState.world.tileSize;
    const worldSize = this.app.gameState.world.size;

    // 线条样式可以提到外面，避免每次循环重复设置
    g.lineStyle(3, 0x00ff88, 0.6);

    for (const a of areas) {
      const { x1, y1, n } = a;

      const px = x1 * tile;
      const py = (worldSize - y1 - n) * tile;  // ⭐ 关键：世界坐标 → 画布坐标

      const size = n * tile;

      g.drawRect(px, py, size, size);
    }
  }
}
