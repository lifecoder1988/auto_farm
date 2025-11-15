// engine/snake/SnakeManager.js

export class SnakeManager {
    constructor(app, baseRenderer, tileSize, mapSize) {
        this.app = app;
        this.baseRenderer = baseRenderer;
        this.tile = tileSize;
        this.mapSize = mapSize;

        this.bodyLayer = new PIXI.Container();
        this.foodLayer = new PIXI.Container();

        app.stage.addChild(this.bodyLayer);
        app.stage.addChild(this.foodLayer);
    }

    clear() {
        this.bodyLayer.removeChildren();
        this.foodLayer.removeChildren();
    }

    destroy() {
        // 1. 清空内容
        this.clear();

        // 2. 从 stage 移除
        if (this.bodyLayer.parent) {
            this.bodyLayer.parent.removeChild(this.bodyLayer);
        }
        if (this.foodLayer.parent) {
            this.foodLayer.parent.removeChild(this.foodLayer);
        }

        // 3. 彻底销毁 PIXI 对象
        this.bodyLayer.destroy({ children: true });
        this.foodLayer.destroy({ children: true });
    }

    draw(model) {
        if (!model.alive) return;

        this.clear();

        // 渲染蛇身体（左下角 0,0 坐标系）
        for (const seg of model.body) {
            const g = new PIXI.Graphics();

            const screenY = (this.mapSize - 1 - seg.y) * this.tile;

            g.beginFill(this.baseRenderer.bodyColor);
            g.drawRect(seg.x * this.tile, screenY, this.tile, this.tile);
            g.endFill();

            this.bodyLayer.addChild(g);
        }

        // 渲染食物（左下角 0,0 坐标）
        const f = model.food;
        const fg = new PIXI.Graphics();

        const fy = (this.mapSize - 1 - f.y) * this.tile + this.tile / 2;

        fg.beginFill(this.baseRenderer.foodColor);
        fg.drawCircle(
            f.x * this.tile + this.tile / 2,
            fy,
            this.tile / 3
        );
        fg.endFill();

        this.foodLayer.addChild(fg);
    }
}
