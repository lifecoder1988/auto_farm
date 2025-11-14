// engine/crops/PotatoCrop.js
import { CropBase } from './CropBase.js';

export class PotatoCrop extends CropBase {
  constructor() {
    super({
      url: 'asset/image/potato.png',
      size: 256,
      frames: 4,
    });
  }

  get type() { return '土豆'; }
}
