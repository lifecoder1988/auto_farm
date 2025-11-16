export function renderAllMazes(app) {
  const layer = app.layers.mazeLayer;
  layer.removeChildren();

  const mazes = app.mazeManager.getAll();

  const wallTexture = app.mazeTextures.wall;
  const treasureTexture = app.mazeTextures.treasure;

  for (const maze of mazes) {
    drawOneMaze(app, maze, layer, wallTexture, treasureTexture);
  }
}


export function drawOneMaze(app, maze, layer, wallTexture, treasureTexture) {
  const tileSize = app.gameState.world.tileSize;
  const worldSize = app.gameState.world.size;

  // 渲染墙体
  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      const cell = maze.grid[y][x];  // 使用迷宫网格
      const gx = maze.startX + x;
      const gy = maze.startY + y;

      const px = gx * tileSize;
      const py = (worldSize - 1 - gy) * tileSize;

      // 上墙
      if (cell.walls.up) {
        const s = new PIXI.Sprite(wallTexture);
        s.width = tileSize;
        s.height = tileSize / 4;
        s.x = px;
        s.y = py;
        layer.addChild(s);
      }

      // 下墙
      if (cell.walls.down) {
        const s = new PIXI.Sprite(wallTexture);
        s.width = tileSize;
        s.height = tileSize / 4;
        s.x = px;
        s.y = py + tileSize;
        s.rotation = Math.PI;
        layer.addChild(s);
      }

      // 左墙
      if (cell.walls.left) {
        const s = new PIXI.Sprite(wallTexture);
        s.width = tileSize;
        s.height = tileSize / 4;
        s.anchor.set(0, 1);
        s.rotation = -Math.PI / 2;
        s.x = px;
        s.y = py + tileSize;
        layer.addChild(s);
      }

      // 右墙
      if (cell.walls.right) {
        const s = new PIXI.Sprite(wallTexture);
        s.width = tileSize;
        s.height = tileSize / 4;
        s.anchor.set(1, 0);
        s.rotation = Math.PI / 2;
        s.x = px + tileSize;
        s.y = py;
        layer.addChild(s);
      }
    }
  }

  // 渲染宝藏
  const t = maze.getTreasureGlobal();
  const tx = t.x * tileSize;
  const ty = (worldSize - 1 - t.y) * tileSize;

  const treasure = new PIXI.Sprite(treasureTexture);
  treasure.width = tileSize;
  treasure.height = tileSize;
  treasure.x = tx;
  treasure.y = ty;

  layer.addChild(treasure);
}


