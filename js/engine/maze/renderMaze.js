export function renderAllMazes(app) {
  const layer = app.layers.mazeLayer;
  layer.removeChildren();

  const mazes = app.mazeManager.getAll();

  const { horizontal, vertical, treasure } = app.mazeManager.getTextures();

  for (const maze of mazes) {
    drawOneMaze(app, maze, layer, horizontal, vertical, treasure);
  }
}

export function drawOneMaze(app, maze, layer, horizontalTexture, verticalTexture, treasureTexture) {
  const tileSize = app.gameState.world.tileSize;
  const worldSize = app.gameState.world.size;

  const wallThickness = tileSize * 0.18; // 18% 厚度，看着舒服

  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {

      const cell = maze.grid[y][x];

      // 全局坐标
      const gx = maze.startX + x;
      const gy = maze.startY + y;

      // Pixi 坐标（左上角）
      const px = gx * tileSize;
      const py = (worldSize - 1 - gy) * tileSize;

      // ────────────────────────────────
      // ⭐ 画“上墙”：横纹
      // ────────────────────────────────
      if (cell.walls.up) {
        const s = new PIXI.Sprite(horizontalTexture);
        s.width  = tileSize;
        s.height = wallThickness;
        s.x = px;
        s.y = py;
        layer.addChild(s);
      }

      // ⭐ 下墙
      if (cell.walls.down) {
        const s = new PIXI.Sprite(horizontalTexture);
        s.width  = tileSize;
        s.height = wallThickness;
        s.x = px;
        s.y = py + tileSize - wallThickness;
        layer.addChild(s);
      }

      // ⭐ 左墙（竖纹）
      if (cell.walls.left) {
        const s = new PIXI.Sprite(verticalTexture);
        s.width  = wallThickness;
        s.height = tileSize;
        s.x = px;
        s.y = py;
        layer.addChild(s);
      }

      // ⭐ 右墙（竖纹）
      if (cell.walls.right) {
        const s = new PIXI.Sprite(verticalTexture);
        s.width  = wallThickness;
        s.height = tileSize;
        s.x = px + tileSize - wallThickness;
        s.y = py;
        layer.addChild(s);
      }
    }
  }

  // ────────────────────────────────
  // ⭐ 宝藏
  // ────────────────────────────────
  const t = maze.getTreasureGlobal();
  const treasure = new PIXI.Sprite(treasureTexture);
  treasure.width  = tileSize;
  treasure.height = tileSize;
  treasure.x = t.x * tileSize;
  treasure.y = (worldSize - 1 - t.y) * tileSize;
  layer.addChild(treasure);
}
