// engine/snake/SnakeGame.js

import { Snake } from './Snake.js';
import { SnakeBase } from './SnakeBase.js';
import { SnakeManager } from './SnakeManager.js';
import { SnakeController } from './SnakeController.js';

export class SnakeGame {
  constructor(app, { startX, startY }) {
    this.app = app;

    const worldSize = app.gameState.worldSize;
    const tileSize = app.gameState.tileSize;

    this.startX = startX ?? 0;
    this.startY = startY ?? 0;

    // 1. model（蛇的身体数据）
    this.model = new Snake(worldSize, this.startX, this.startY);

    // 2. controller（逻辑控制：移动、判死、吃苹果…）
    this.controller = new SnakeController(this.model);

    // 3. renderer（画蛇）
    this.renderer = new SnakeManager(
      app,
      new SnakeBase({}),
      tileSize,
      worldSize
    );
  }

  /** 当蛇死亡时自动重开 */
  restart() {
    const worldSize = this.app.gameState.worldSize;

    this.model = new Snake(worldSize, this.startX, this.startY);
    this.controller = new SnakeController(this.model);
  }

  /** step(dir): 每次玩家 move 调用一次 */
  step(dir) {
    const alive = this.controller.step(dir);

    if (!alive) {
      console.warn("Snake died! Restarting...");
      this.restart();
    }
  }

  /** 每帧渲染 */
  render() {
    const worldSize = this.app.gameState.worldSize;
    const tileSize = this.app.gameState.tileSize;

    // 如果世界大小变化（setWorldSize），renderer 要更新
    if (this.renderer.worldSize !== worldSize ||
        this.renderer.tileSize !== tileSize) {

      this.renderer.worldSize = worldSize;
      this.renderer.tileSize = tileSize;

      // 可以选择清空一下让渲染更干净
      if (this.renderer.clear) this.renderer.clear();
    }

    this.renderer.draw(this.model);
  }
}
