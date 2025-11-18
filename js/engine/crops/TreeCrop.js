// engine/crops/PumpkinCrop.js
import { CropBase } from './CropBase.js';

export class TreeCrop extends CropBase {
  constructor() {
    super({
      url: 'asset/image/tree.png',
      size: 256,
      frames: 1,
    });
  }

  get type() { return '树'; }
}
