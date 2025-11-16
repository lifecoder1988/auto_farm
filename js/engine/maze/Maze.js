export class Maze {
  constructor({ startX = 0, startY = 0, size = 5 }) {
    this.startX = startX;
    this.startY = startY;
    this.size = size;

    // 初始化迷宫网格
    this.grid = [];
    for (let y = 0; y < size; y++) {
      this.grid[y] = [];
      for (let x = 0; x < size; x++) {
        this.grid[y][x] = {
          visited: false,
          walls: { up: true, down: true, left: true, right: true }
        };
      }
    }

    this._generate();

    // 随机宝藏
    this.treasure = {
      x: Math.floor(Math.random() * size),
      y: Math.floor(Math.random() * size)
    };
  }

  // DFS生成迷宫
  _generate() {
    const stack = [];
    const sx = 0, sy = 0;
    this.grid[sy][sx].visited = true;
    stack.push({ x: sx, y: sy });

    const dirs = [
      { dx: 0, dy: 1, wallA: 'up', wallB: 'down' },
      { dx: 0, dy: -1, wallA: 'down', wallB: 'up' },
      { dx: -1, dy: 0, wallA: 'left', wallB: 'right' },
      { dx: 1, dy: 0, wallA: 'right', wallB: 'left' },
    ];

    while (stack.length > 0) {
      const { x, y } = stack[stack.length - 1];
      const neighbors = [];

      for (const d of dirs) {
        const nx = x + d.dx;
        const ny = y + d.dy;

        if (nx < 0 || ny < 0 || nx >= this.size || ny >= this.size) continue;
        if (!this.grid[ny][nx].visited) {
          neighbors.push({ nx, ny, d });
        }
      }

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const { nx, ny, d } = neighbors[Math.floor(Math.random() * neighbors.length)];
        // 打开墙
        this.grid[y][x].walls[d.wallA] = false;
        this.grid[ny][nx].walls[d.wallB] = false;

        this.grid[ny][nx].visited = true;
        stack.push({ x: nx, y: ny });
      }
    }
  }

  // 获取宝藏全局坐标
  getTreasureGlobal() {
    return {
      x: this.startX + this.treasure.x,
      y: this.startY + this.treasure.y
    };
  }
}
