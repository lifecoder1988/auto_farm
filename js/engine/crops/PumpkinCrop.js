// engine/crops/PumpkinCrop.js
import { CropBase } from './CropBase.js';

export class PumpkinCrop extends CropBase {
  constructor() {
    super({
      url: 'asset/image/pumpkin.png',
      size: 256,
      frames: 4,
    });
  }

  get type() { return '南瓜'; }
}
