// engine/map.js
import { drawCrops } from './crops.js';
// 将来这里也可以 import updateEntities

export function drawMapFrame({ app, mapSize, tileSize, crops, entities }) {
  drawCrops({ crops, mapSize, tileSize });
  // TODO: updateEntities(entities, mapSize, tileSize)
}
