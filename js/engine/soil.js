// engine/soil.js
// 方案 B：每格一个 sprite，缓存不重建
export function initSoilLayer({ mapSize, tileSize, url, soilLayer }) {
  const tex = PIXI.Texture.from(url);
  const soilSprites = new Map();

  for (let y = 0; y < mapSize; y++) {
    for (let x = 0; x < mapSize; x++) {
      const key = `${x}_${y}`;
      const sprite = new PIXI.Sprite(tex);

      sprite.width = tileSize;
      sprite.height = tileSize;

      sprite.x = x * tileSize;
      sprite.y = (mapSize - 1 - y) * tileSize;

      soilLayer.addChild(sprite);
      soilSprites.set(key, sprite);
    }
  }

  // 返回一个 resize 函数给调用者用
  return function resizeSoilLayer(newTileSize) {
    for (const [key, sprite] of soilSprites.entries()) {
      const [x, y] = key.split('_').map(Number);
      sprite.width = newTileSize;
      sprite.height = newTileSize;
      sprite.x = x * newTileSize;
      sprite.y = (mapSize - 1 - y) * newTileSize;
    }
  };
}

// 如果想单独导出也可以：
export function resizeSoilLayer() {
  // 可选：你也可以在这里存 soilSprites，略
}
