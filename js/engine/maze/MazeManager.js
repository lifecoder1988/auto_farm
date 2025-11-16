export class MazeManager {
    constructor(app) {
        this.app = app;
        this.mazes = [];
        this.textures = {
            wall: PIXI.Texture.from('asset/image/wall.png'),
            treasure: PIXI.Texture.from('asset/image/treasure.png'),
        };
    }

    getTextures() {
        return this.textures;
    }
    addMaze(maze) {
        this.mazes.push(maze);
        this._deleteCropsInside(maze);
    }

    _deleteCropsInside(maze) {
        const crops = this.app.gameState.crops;

        for (let y = 0; y < maze.size; y++) {
            for (let x = 0; x < maze.size; x++) {
                const gx = maze.startX + x;
                const gy = maze.startY + y;
                const key = `${gx}_${gy}`;

                if (crops[key]) {
                    delete crops[key]; // ⭐彻底删除 crop
                }
            }
        }
    }

    getAll() { return this.mazes; }

    clear() {
        this.mazes = [];
    }
}
