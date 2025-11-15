// engine/snake/SnakeGame.js

import { Snake } from './Snake.js';
import { SnakeBase } from './SnakeBase.js';
import { SnakeManager } from './SnakeManager.js';
import { SnakeController } from './SnakeController.js';

export class SnakeGame {
  constructor(app, tileSize, mapSize, { startX, startY }) {
    this.model = new Snake(mapSize, startX, startY);
    this.controller = new SnakeController(this.model);
    this.renderer = new SnakeManager(app, new SnakeBase({}), tileSize, mapSize);

  }

  restart() {
    this.model = new Snake(this.mapSize);
    this.controller = new SnakeController(this.model);

    // 渲染对象不需要重建，继续用
    }

  /** move(dir) 直接控制蛇一步 */
  step(dir) {
    const alive = this.controller.step(dir);

    if (!alive) {
        // 可选：提示
        console.warn("Snake died! Restarting...");

        this.restart();   // 🚨 自动重开一局
    }
  }

  /** 每帧渲染 */
  render() {
    this.renderer.draw(this.model);
  }
}
