import { Character } from './Character.js';

export class Drone extends Character {
  static url = "asset/image/drone.png";
  static size = 256;
  static frames = 4;
  static anchor = [0.5, 0.6];
  static animSpeed = 0.25;

  constructor(entity, meta, layer) {
    super(entity, meta, layer);
    this.sprite.anchor.set(...Drone.anchor);
    this.sprite.animationSpeed = Drone.animSpeed;
  }
}
