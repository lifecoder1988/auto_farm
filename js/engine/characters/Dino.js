import { Character } from './Character.js';

export class Dino extends Character {
  static url = "asset/image/dino.png";
  static size = 256;
  static frames = 3;
  static anchor = [0.5, 0.7];
  static animSpeed = 0.2;

  constructor(entity, meta, layer) {
    super(entity, meta, layer);
    this.sprite.anchor.set(...Dino.anchor);
    this.sprite.animationSpeed = Dino.animSpeed;
  }
}
