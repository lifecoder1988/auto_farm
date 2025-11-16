export function renderAllMazes(app) {
  const layer = app.layers.mazeLayer;
  layer.removeChildren();

  const mazes = app.mazeManager.getAll();

  const { wall, treasure } = app.mazeManager.getTextures();

  for (const maze of mazes) {
    drawOneMaze(app, maze, layer, wall, treasure);
  }
}


export function drawOneMaze(app, maze, layer, wallTexture, treasureTexture) {
  const tileSize = app.gameState.world.tileSize;
  const worldSize = app.gameState.world.size;

  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      const cell = maze.grid[y][x];
      const gx = maze.startX + x;
      const gy = maze.startY + y;

      const px = gx * tileSize;
      const py = (worldSize - 1 - gy) * tileSize;

      // ⬜ 如果有上墙 → 放一个方块障碍物
      if (cell.walls.up) {
        const sprite = new PIXI.Sprite(wallTexture);
        sprite.width = tileSize;
        sprite.height = tileSize;
        sprite.x = px;
        sprite.y = py;
        layer.addChild(sprite);
      }

      // ⬜ 下墙
      if (cell.walls.down) {
        const sprite = new PIXI.Sprite(wallTexture);
        sprite.width = tileSize;
        sprite.height = tileSize;
        sprite.x = px;
        sprite.y = py + tileSize;
        layer.addChild(sprite);
      }

      // ⬜ 左墙
      if (cell.walls.left) {
        const sprite = new PIXI.Sprite(wallTexture);
        sprite.width = tileSize;
        sprite.height = tileSize;
        sprite.x = px;
        sprite.y = py;
        layer.addChild(sprite);
      }

      // ⬜ 右墙
      if (cell.walls.right) {
        const sprite = new PIXI.Sprite(wallTexture);
        sprite.width = tileSize;
        sprite.height = tileSize;
        sprite.x = px + tileSize;
        sprite.y = py;
        layer.addChild(sprite);
      }
    }
  }

  // ⭐ 渲染宝藏
  const t = maze.getTreasureGlobal();
  const treasure = new PIXI.Sprite(treasureTexture);
  treasure.width = tileSize;
  treasure.height = tileSize;
  treasure.x = t.x * tileSize;
  treasure.y = (worldSize - 1 - t.y) * tileSize;
  layer.addChild(treasure);
}



