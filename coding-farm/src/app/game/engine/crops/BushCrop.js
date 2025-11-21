// engine/crops/PumpkinCrop.js
import { CropBase } from "./CropBase.js";

export class BushCrop extends CropBase {
  constructor() {
    super({
      url: "/images/bush.png",
      size: 256,
      frames: 1,
    });
  }

  get type() {
    return "灌木丛";
  }
}
