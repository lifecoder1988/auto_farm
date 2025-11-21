// engine/crops/PumpkinCrop.js
import { CropBase } from "./CropBase.js";

export class CactusCrop extends CropBase {
  constructor() {
    super({
      url: "/images/cactus.png",
      size: 256,
      frames: 1,
    });
  }

  get type() {
    return "仙人掌";
  }
}
