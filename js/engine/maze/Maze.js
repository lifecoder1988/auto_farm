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

        this.treasure = null;
        this.reward = 0;   // ⭐ 宝藏奖励
    }

    /** 从全局坐标 (gx, gy) 朝 direction 是否能移动 */
    canMove(gx, gy, direction) {
        const size = this.size;

        // 不在迷宫内 → 不受限制
        if (
            gx < this.startX ||
            gy < this.startY ||
            gx >= this.startX + size ||
            gy >= this.startY + size
        ) {
            return true;
        }

        const lx = gx - this.startX;
        const ly = gy - this.startY;

        const cell = this.grid[ly][lx];
        if (!cell) return true;

        switch (direction) {
            case "up":
            case "Up":
            case "north":
                return !cell.walls.up;
            case "down":
            case "Down":
            case "south":
                return !cell.walls.down;
            case "left":
            case "Left":
            case "west":
                return !cell.walls.left;
            case "right":
            case "Right":
            case "east":
                return !cell.walls.right;
        }
        return true;
    }


    /** 生成迷宫（DFS），返回是否成功 */
    generate(px, py) {
        const size = this.size;
        const g = this.grid;

        // reset
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                g[y][x].visited = false;
                g[y][x].walls = { up: true, down: true, left: true, right: true };
            }
        }

        const sx = px - this.startX;
        const sy = py - this.startY;

        if (sx < 0 || sy < 0 || sx >= size || sy >= size) {
            return false;
        }

        // 记录入口（用于宝藏禁止落点）
        this.entryX = sx;
        this.entryY = sy;

        const stack = [];
        g[sy][sx].visited = true;
        stack.push({ x: sx, y: sy });

        const dirs = [
            { dx: 0, dy: 1, wallA: "up", wallB: "down" },
            { dx: 0, dy: -1, wallA: "down", wallB: "up" },
            { dx: -1, dy: 0, wallA: "left", wallB: "right" },
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

                g[y][x].walls[d.wallA] = false;
                g[ny][nx].walls[d.wallB] = false;

                g[ny][nx].visited = true;
                stack.push({ x: nx, y: ny });
            }
        }

        // ⭐ 选择宝藏位置
        this._chooseTreasure();

        // ⭐ 生成奖励
        this._generateTreasureReward();

        return true;
    }

    _chooseTreasure() {
        const size = this.size;
        const list = [];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {

                // 入口点禁止
                if (x === this.entryX && y === this.entryY) continue;

                const w = this.grid[y][x].walls;

                if (!(w.up && w.down && w.left && w.right)) {
                    list.push({ x, y });
                }
            }
        }

        if (list.length === 0) {
            this.treasure = { x: size - 1, y: size - 1 };
        } else {
            this.treasure = list[Math.floor(Math.random() * list.length)];
        }
    }

    /** ⭐ 随机宝藏奖励（500–1000） */
    _generateTreasureReward() {
        this.reward = Math.floor(500 + Math.random() * 501);
    }

    /** 返回全局奖励坐标 */
    getTreasureGlobal() {
        return {
            x: this.startX + this.treasure.x,
            y: this.startY + this.treasure.y,
        };
    }

    /** 获取奖励数值 */
    getTreasureReward() {
        return this.reward;
    }
}
