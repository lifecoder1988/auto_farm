// engine/crops/PumpkinCrop.js
import { CropBase } from './CropBase.js';

export class HayCrop extends CropBase {
  constructor() {
    super({
      url: 'asset/image/hay.png',
      size: 256,
      frames: 1,
    });
  }

  get type() { return '草'; }
}
