export class Maze {
  constructor({ startX = 0, startY = 0, size = 5 }) {
    this.startX = startX;
    this.startY = startY;
    this.size = size;

    // grid[y][x]
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
  }

  /** 生成迷宫（DFS），返回是否成功 */
  generate(px, py) {
    const size = this.size;
    const g = this.grid;

    // ⭐ 关键：清空 visited（再次生成时需要）
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        g[y][x].visited = false;
        g[y][x].walls = { up: true, down: true, left: true, right: true };
      }
    }

    // ⭐ 转换为本地坐标
    const sx = px - this.startX;
    const sy = py - this.startY;

    if (sx < 0 || sy < 0 || sx >= size || sy >= size) {
      return false;
    }

    const stack = [];
    g[sy][sx].visited = true;
    stack.push({ x: sx, y: sy });

    const dirs = [
      { dx: 0, dy: 1, wallA: "up",    wallB: "down" },
      { dx: 0, dy: -1, wallA: "down", wallB: "up"   },
      { dx: -1, dy: 0, wallA: "left", wallB: "right"},
      { dx: 1, dy: 0, wallA: "right", wallB: "left" }
    ];

    while (stack.length > 0) {
      const { x, y } = stack[stack.length - 1];

      const neighbors = [];

      for (const d of dirs) {
        const nx = x + d.dx;
        const ny = y + d.dy;

        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;

        if (!g[ny][nx].visited) {
          neighbors.push({ nx, ny, d });
        }
      }

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const { nx, ny, d } =
          neighbors[Math.floor(Math.random() * neighbors.length)];

        // 打开墙
        g[y][x].walls[d.wallA] = false;
        g[ny][nx].walls[d.wallB] = false;

        g[ny][nx].visited = true;
        stack.push({ x: nx, y: ny });
      }
    }

    // ⭐ 选择宝藏
    this._chooseTreasure();

    return true;
  }

  _chooseTreasure() {
    const size = this.size;
    const list = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const w = this.grid[y][x].walls;

        // ⭐ 有至少一条方向是打开的，避免无法进入宝藏格
        if (!(w.up && w.down && w.left && w.right)) {
          list.push({ x, y });
        }
      }
    }

    if (list.length === 0) {
      // 理论极小概率发生，但保险
      this.treasure = { x: size - 1, y: size - 1 };
    } else {
      this.treasure = list[Math.floor(Math.random() * list.length)];
    }
  }

  getTreasureGlobal() {
    return {
      x: this.startX + this.treasure.x,
      y: this.startY + this.treasure.y,
    };
  }
}
