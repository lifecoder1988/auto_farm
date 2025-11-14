export class Character {
  constructor(entity, textureMeta, layer) {
    this.id = entity.id;
    this.type = entity.type;
    this.x = entity.x;
    this.y = entity.y;

    this.textureMeta = textureMeta;

    this.container = new PIXI.Container();
    this.sprite = new PIXI.AnimatedSprite(textureMeta.frames);

    this.sprite.anchor.set(0.5, 0.6);
    this.sprite.animationSpeed = 0.25;
    this.sprite.play();

    this.container.addChild(this.sprite);
    layer.addChild(this.container);
  }

  update(entity, mapSize, tileSize) {
    this.x = entity.x;
    this.y = entity.y;

    // ---- 平滑移动 ----
    const targetX = entity.x * tileSize + tileSize / 2;
    const targetY = (mapSize - 1 - entity.y) * tileSize + tileSize / 2;

    this.container.x += (targetX - this.container.x) * 0.25;
    this.container.y += (targetY - this.container.y) * 0.25;

    // ---- 平滑缩放 ----
    const pad = Math.max(4, tileSize * 0.12);
    const maxSide = Math.max(8, tileSize - pad * 2);
    const scale = Math.min(maxSide / this.textureMeta.size, 1);

    this.sprite.scale.x += (scale - this.sprite.scale.x) * 0.25;
    this.sprite.scale.y += (scale - this.sprite.scale.y) * 0.25;
  }

  destroy(layer) {
    layer.removeChild(this.container);
  }
}
