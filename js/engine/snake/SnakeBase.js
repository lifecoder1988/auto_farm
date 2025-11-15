// engine/snake/SnakeBase.js

export class SnakeBase {
  constructor({ bodyColor = 0x00ff00, foodColor = 0xff0000 }) {
    this.bodyColor = bodyColor;
    this.foodColor = foodColor;
  }

  renderBodySegment(g, tileSize, seg) {
    g.beginFill(this.bodyColor);
    g.drawRect(seg.x * tileSize, seg.y * tileSize, tileSize, tileSize);
    g.endFill();
  }

  renderFood(g, tileSize, food) {
    g.beginFill(this.foodColor);
    g.drawCircle(
      food.x * tileSize + tileSize / 2,
      food.y * tileSize + tileSize / 2,
      tileSize / 3
    );
    g.endFill();
  }
}
