import { Maze } from "./Maze.js";

export class MazeManager {
    constructor(app) {
        this.app = app;
        this.mazes = [];
        this.textures = this._loadTextures();
    }

    getAll() {
        return this.mazes;
    }

    deleteAll() {
        this.mazes = [];
    }


    deleteMaze(maze) {
        const idx = this.mazes.indexOf(maze);
        if (idx !== -1) {
            this.mazes.splice(idx, 1);
        }
    }
    overlapExists(sx, sy, n) {
        for (const m of this.mazes) {
            const ax1 = m.startX;
            const ay1 = m.startY;
            const ax2 = m.startX + m.size - 1;
            const ay2 = m.startY + m.size - 1;

            const bx1 = sx;
            const by1 = sy;
            const bx2 = sx + n - 1;
            const by2 = sy + n - 1;

            const overlap =
                !(bx2 < ax1 || bx1 > ax2 || by2 < ay1 || by1 > ay2);

            if (overlap) return true;
        }
        return false;
    }

    /** 尝试创建迷宫，成功返回 Maze 对象，否则返回 false */
    createMaze(globalX, globalY, n) {
        const size = this.app.gameState.world.size;

        const px = globalX;
        const py = globalY;

        const d = n - 1;

        const candidates = [
            { sx: px, sy: py },
            { sx: px - d, sy: py },
            { sx: px, sy: py - d },
            { sx: px - d, sy: py - d }
        ];

        for (const { sx, sy } of candidates) {
            // 越界检查
            if (sx < 0 || sy < 0) continue;
            if (sx + n > size || sy + n > size) continue;

            // 重叠检查
            if (this.overlapExists(sx, sy, n)) continue;

            // 创建迷宫
            const maze = new Maze({ startX: sx, startY: sy, size: n });

            const ok = maze.generate(px, py);
            if (!ok) continue;

            this.mazes.push(maze);

            // 清空迷宫范围内农作物
            
            for (let y = sy; y < sy + n; y++) {
                for (let x = sx; x < sx + n; x++) {
                    this.app.cropManager.delete(x, y);
                    this.app.soilManager.makeSoil(x, y);
                }
            }
            console.log(maze)
            return maze;
        }

        return false;
    }

    /** 判断一个全局坐标是否在任何迷宫内部 */
    isInMaze(x, y) {
        for (const maze of this.mazes) {
            const mx1 = maze.startX;
            const my1 = maze.startY;
            const mx2 = maze.startX + maze.size - 1;
            const my2 = maze.startY + maze.size - 1;

            if (x >= mx1 && x <= mx2 && y >= my1 && y <= my2) {
                return maze; // 返回该迷宫
            }
        }

        return null; // 不在任何迷宫中
    }


    getTextures() {
        return this.textures;   // ⭐ 返回 horizontal / vertical / treasure
    }

    _loadTextures() {
        // 加载整张图
        const wallTex = PIXI.Texture.from("asset/image/wall.png");
        const treasureTex = PIXI.Texture.from("asset/image/treasure.png");

        const textures = {
            horizontal: null,
            vertical: null,
            treasure: treasureTex
        };

        // ⭐ 必须等待 wallTex 加载完再切帧
        wallTex.baseTexture.on('loaded', () => {

            const w = wallTex.baseTexture.width;
            const h = wallTex.baseTexture.height;
            const fw = w / 2;

            // 左半：横墙
            textures.horizontal = new PIXI.Texture(
                wallTex.baseTexture,
                new PIXI.Rectangle(0, 0, fw, h)
            );

            // 右半：竖墙
            textures.vertical = new PIXI.Texture(
                wallTex.baseTexture,
                new PIXI.Rectangle(fw, 0, fw, h)
            );

            console.log("Maze textures loaded:", textures);
        });

        return textures;
    }

}
