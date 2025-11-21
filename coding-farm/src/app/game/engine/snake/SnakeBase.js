// engine/snake/SnakeBase.js

export class SnakeBase {
  constructor({
    headTexture = null,
    bodyTexture = null,
    tailTexture = null,
    appleTexture = null,
    foodColor = 0xff0000,
    scale = 1.0,
  }) {
    this.headTexture = headTexture;
    this.bodyTexture = bodyTexture;
    this.tailTexture = tailTexture;
    this.appleTexture = appleTexture;
    
    this.scale = scale;   // 用于整体缩放（比如 0.9 看着更可爱）

    this.foodColor = foodColor;
  }
}
