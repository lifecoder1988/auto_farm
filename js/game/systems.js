// js/game/systems.js
import { Inventory } from "../engine/inventory/Inventory.js";
import { EntityManager } from "../engine/entities/EntityManager.js";
import { CharacterManager } from "../engine/characters/CharacterManager.js";
import { CropManager } from "../engine/crops/CropManager.js";
import { Crop } from "../engine/crops/Crop.js";
import { SoilManager } from "../engine/soil/SoilManager.js";
import { UnlockManager } from "../engine/unlock/UnlockManager.js";
import { MazeManager } from "../engine/maze/MazeManager.js";
import { initLayers } from "../engine/layers.js";
import { detectSquaresUnique, applyMergeArea } from "../engine/crops/CropMerge.js";
import { CropEventBus } from "../engine/crops/CropEventBus.js";
import { TECH_TREE } from "../data/unlock.js";
import CONSTANTS from "../engine/core/constants.js";

/**
 * 初始化所有基础系统（背包、实体、角色、作物、土地、科技、迷宫等）
 */
export function setupSystems(app, saveData = null) {

  // ============================
  // 图层初始化
  // ============================
  app.layers = initLayers(app);

  // ============================
  // Inventory 背包
  // ============================
  const defaultInv = {
    pumpkin: 10000,
    gold: 0,
    apple: 0,
    hay: 10000,
    wood: 10000,
    carrot: 10000,
    cactus: 10000,
    sunflower: 0,
    water: 0,
    fertilizer: 0,
  };

  app.inventory = new Inventory(saveData?.inventory || defaultInv);


  // ============================
  // EntityManager 实体系统
  // ============================
  const entityManager = new EntityManager();
  entityManager.initDefault();

  // 存档恢复实体
  if (saveData?.player) {
    entityManager.fromPlain(saveData.player.entities);
   
  }

  app.entityManager = entityManager;


  // ============================
  // CropManager 作物系统
  // ============================
  app.cropManager = new CropManager();
  app.cropManager.updateConfig(
    app.gameState.world.size,
    app.gameState.world.tileSize
  );

  if (saveData?.crops) {
    app.cropManager.import(saveData.crops);
  }


  // ============================
  // SoilManager 土壤系统
  // ============================
  const soilTextures = {
    grass: PIXI.Texture.from("asset/image/grass.png"),
    soil: PIXI.Texture.from("asset/image/soil.png"),
  };

  app.soilManager = new SoilManager({
    mapSize: app.gameState.world.size,
    tileSize: app.gameState.world.tileSize,
    soilLayer: app.layers.soilLayer,
    textures: soilTextures,
  });

  if (saveData?.soil) {
    app.soilManager.import(saveData.soil);
  }


  // ============================
  // MazeManager 迷宫
  // ============================
  app.mazeManager = new MazeManager(app);

  if (saveData?.mazes) {
    app.mazeManager.import(saveData.mazes);
  }


  // ============================
  // CharacterManager 角色渲染
  // ============================
  app.characterManager = new CharacterManager();


  // ============================
  // UnlockManager 科技系统
  // ============================
  app.unlockManager = new UnlockManager({
    inventory: app.inventory,
    techLevels: saveData?.unlocks?.techLevels || {},
    unlocks: saveData?.unlocks?.unlocks || {},
    techTree: TECH_TREE,
  });


  // ============================
  // Crop Event 事件绑定（合并、成熟）
  // ============================

  CropEventBus.on("crop:mature", () => {
    handleCropMerge(app);
  });

  CropEventBus.on("crop:harvest:merged", () => {
    handleCropMerge(app);
  });


  // 更新背包显示（app.updateInventory 在 UI 中实现）
  app.inventory.onChange(() => {
    app.updateInventory?.();
  });
}


// =====================================================
// 工具：计算正方形区域 + mergeArea
// =====================================================
function handleCropMerge(app) {
  const size = app.gameState.world.size;
  const squares = detectSquaresUnique(app.cropManager, size);

  squares.forEach((area) => applyMergeArea(app.cropManager, area));

  app.cropDebug.drawSquares(squares);
}
