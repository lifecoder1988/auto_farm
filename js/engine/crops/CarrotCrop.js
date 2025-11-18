// engine/crops/PumpkinCrop.js
import { CropBase } from './CropBase.js';

export class CarrotCrop extends CropBase {
  constructor() {
    super({
      url: 'asset/image/carrot.png',
      size: 256,
      frames: 1,
    });
  }

  get type() { return '胡萝卜'; }
}
