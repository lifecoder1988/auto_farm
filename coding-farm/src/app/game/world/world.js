// js/game/world.js
import CONSTANTS from "../engine/core/constants.js";

/**
 * 绘制网格
 */
export function drawGrid(app) {
  const { world } = app.gameState;
  const size = world.size;
  const tile = world.tileSize;
  const gridLayer = app.layers.gridLayer;

  gridLayer.clear();
  gridLayer.lineStyle(1, 0x555555, 1);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      gridLayer.drawRect(x * tile, y * tile, tile, tile);
    }
  }
}

/**
 * 重建世界（尺寸变化/地图更新）
 */
export function rebuildWorld(app) {
  const size = app.gameState.world.size;
  const tile = app.gameState.world.tileSize;

  // 清空 crop / entity layer
  app.cropManager.reset();
  app.cropManager.updateConfig(size, tile);

  app.layers.cropsLayer.removeChildren();
  app.layers.entitiesLayer.removeChildren();

  // 重绘网格
  drawGrid(app);

  // SoilManager 重置（耕地/湿度）
  app.soilManager.resetLayer(size, tile);

  // 角色重绘
  app.characterManager.clear();
  app.characterManager.update(app.entityManager.getAll(), size, tile);

  console.log("地图已重绘");
}

/**
 * 设置世界尺寸（公共 API）
 */
export function setWorldSize(app, size) {
  // 科技限制
  const expandSize = app.unlockManager.getAbilityValue(
    CONSTANTS.UNLOCKS.Expand,
    "世界尺寸",
    3
  );

  if (size < 3) {
    app.appendLog?.(["世界尺寸不能小于 3"], "system");
    return;
  }
  if (size > expandSize) {
    app.appendLog?.([`世界尺寸不能超过 ${expandSize}`], "system");
    return;
  }

  // 修改 gameState 内部尺寸
  app.gameState.setWorldSize(size, app.view.width);

  // 重建世界
  rebuildWorld(app);
}

