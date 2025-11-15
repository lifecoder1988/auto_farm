// engine/snake/Snake.js

export class Snake {
  constructor(mapSize = 10,startX=0, startY=0) {
    this.mapSize = mapSize;

    // 初始方向
    this.direction = 'right';

    // 初始身体（可以改成 3 段）
    this.body = [
      { x: startX, y: startY }
    ];

    // 随机生成食物
    this.food = this.randomFood();

    // 游戏状态
    this.alive = true;
  }

  randomFood() {
    while (true) {
      const fx = Math.floor(Math.random() * this.mapSize);
      const fy = Math.floor(Math.random() * this.mapSize);

      // 不生成在身体上
      if (!this.body.some(b => b.x === fx && b.y === fy)) {
        return { x: fx, y: fy };
      }
    }
  }

  head() {
    return this.body[0];
  }
}
