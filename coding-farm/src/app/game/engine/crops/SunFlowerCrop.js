// engine/crops/PumpkinCrop.js
import { CropBase } from "./CropBase.js";

export class SunFlowerCrop extends CropBase {
  constructor() {
    super({
      url: "/images/sunflower.png",
      size: 256,
      frames: 1,
    });
  }

  get type() {
    return "向日葵";
  }
}
