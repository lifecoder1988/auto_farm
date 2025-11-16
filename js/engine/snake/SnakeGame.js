// engine/snake/SnakeGame.js

import { Snake } from './Snake.js';
import { SnakeBase } from './SnakeBase.js';
import { SnakeManager } from './SnakeManager.js';
import { SnakeController } from './SnakeController.js';

export class SnakeGame {
  constructor(app, { startX, startY }) {
    this.app = app;

    // ----------- 正确读取 GameState -----------
    const worldSize = app.gameState.world.size;
    const tileSize = app.gameState.world.tileSize;

    this.startX = startX ?? 0;
    this.startY = startY ?? 0;

    // ---------- Model ----------
    this.model = new Snake(worldSize, this.startX, this.startY);

    // ---------- Controller ----------
    this.controller = new SnakeController(this.model);

    // ---------- Renderer ----------
    this.renderer = new SnakeManager(
      app,
      new SnakeBase({}),
      tileSize,
      worldSize
    );
  }

  /** 🌀 死亡后重开 */
  restart() {
    const worldSize = this.app.gameState.world.size;
    const tileSize = this.app.gameState.world.tileSize;

    this.model = new Snake(worldSize, this.startX, this.startY);
    this.controller = new SnakeController(this.model);

    if (this.renderer.updateConfig) {
      this.renderer.updateConfig(tileSize, worldSize);
    }
  }

  /** 🏃 移动一步 */
  step(dir) {
    const alive = this.controller.step(dir);
    if (!alive) {
      console.warn("Snake died! Restarting...");
      this.restart();
    }
  }

  /** 🎨 每帧渲染 */
  render() {
    const worldSize = this.app.gameState.world.size;
    const tileSize = this.app.gameState.world.tileSize;

    // 如果世界变化（setWorldSize） → 同步渲染器
    if (this.renderer.worldSize !== worldSize ||
        this.renderer.tileSize !== tileSize) {

      if (this.renderer.updateConfig) {
        this.renderer.updateConfig(tileSize, worldSize);
      } else {
        this.renderer.worldSize = worldSize;
        this.renderer.tileSize = tileSize;
      }

      if (this.renderer.clear) this.renderer.clear();
    }

    this.renderer.draw(this.model);
  }
}
