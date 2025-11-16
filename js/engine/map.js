// engine/map.js
import { drawCrops } from './crops.js';
// 将来这里也可以 import updateEntities
import { updateDrones } from './drone.js';
export function drawMapFrame({ app, mapSize, tileSize, crops, entities }) {

  console.log("🔍 绘制地图帧:", mapSize, tileSize);
  app.cropManager.draw({
    crops,
    mapSize,
    tileSize
  });

  app.characterManager.update(entities, mapSize, tileSize);
}
