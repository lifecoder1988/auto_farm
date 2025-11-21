export class Entity {
  constructor({
    id,
    x = 0,
    y = 0,
    type = 'drone',
    hat = 'Straw_Hat'
  }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.hat = hat;
  }

  move(direction, worldSize) {
    switch (direction) {
      case 'up': this.y++; break;
      case 'down': this.y--; break;
      case 'left': this.x--; break;
      case 'right': this.x++; break;
      default:
        throw new Error('未知方向: ' + direction);
    }

    const wrap = v => ((v % worldSize) + worldSize) % worldSize;
    this.x = wrap(this.x);
    this.y = wrap(this.y);
  }

  toPlain() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      type: this.type,
      hat: this.hat
    };
  }
}
