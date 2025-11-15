// engine/snake/SnakeController.js

export class SnakeController {
  constructor(model) {
    this.m = model;
  }


 

  step(dir) {
    if (!this.m.alive) return false;

    const head = { ...this.m.head() };

    // 直接按 move() 给的方向移动
    if (dir === 'up') head.y++;
    if (dir === 'down') head.y--;
    if (dir === 'left') head.x--;
    if (dir === 'right') head.x++;

    // 撞墙
    if (
      head.x < 0 || head.x >= this.m.mapSize ||
      head.y < 0 || head.y >= this.m.mapSize
    ) {
      this.m.alive = false;
      return false;
    }

    // 撞身体
    for (const seg of this.m.body) {
      if (seg.x === head.x && seg.y === head.y) {
        this.m.alive = false;
        return false;
      }
    }

    // 插头
    this.m.body.unshift(head);

    // 如果吃到食物
    if (head.x === this.m.food.x && head.y === this.m.food.y) {
      this.m.food = this.m.randomFood();
    } else {
      // 没吃到 → 删除尾巴
      this.m.body.pop();
    }
    
    return true;
  }
}
