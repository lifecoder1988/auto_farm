// js/game/api.js

import { CROP_TYPES } from "../engine/crops/CropManager.js";
import { Crop } from "../engine/crops/Crop.js";
import CONSTANTS from "../engine/core/constants.js";
/**
 * 构建所有游戏 API（供 worker 与 UI 调用）
 */
export function createGameAPI(app) {
  const entityManager = app.entityManager;
  const cropManager = app.cropManager;
  const soil = app.soilManager;
  const mazeManager = app.mazeManager;
  const unlock = app.unlockManager;
  const inventory = app.inventory;
  const appendSystemLog = app.ui.console.system;
  // =====================================================
  // 工具：世界信息
  // =====================================================
  function getWorldSize() {
    return app.gameState.world.size;
  }
  function getTileSize() {
    return app.gameState.world.tileSize;
  }

  // =====================================================
  // 移动
  // =====================================================
  function move(direction, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    // 迷宫内移动逻辑
    const maze = mazeManager.isInMaze(e.x, e.y);
    if (maze) {
      if (!maze.canMove(e.x, e.y, direction)) return false;

      entityManager.move(direction, getWorldSize(), id);

      // 宝藏检查
      const treasure = maze.getTreasureGlobal();
      if (treasure.x === e.x && treasure.y === e.y) {
        const reward = maze.getTreasureReward();
        inventory.add("gold", reward);

        mazeManager.deleteMaze(maze);
        console.log("宝藏已收集，迷宫删除，奖励:", reward);
      }
      return;
    }

    // 普通移动
    return entityManager.move(direction, getWorldSize(), id);
  }

  // =====================================================
  // 耕地
  // =====================================================
  function till(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    if (soil.getType(e.x, e.y) === "grass") {
      soil.makeSoil(e.x, e.y);
      cropManager.delete(e.x, e.y);
      return;
    } else {
      cropManager.delete(e.x, e.y);
      soil.makeGrass(e.x, e.y);
    }
  }

  function getGroundType(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    return soil.getType(e.x, e.y);
  }

  function getCropType(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    return cropManager.get(e.x, e.y)?.type;
  }

  // =====================================================
  // 测量
  // =====================================================
  function measure(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    if (app.gameState.mode === "snake") {
      return app.snakeGame.getFood();
    }
    const maze = mazeManager.isInMaze(e.x, e.y);
    if (maze) {
      return maze.getTreasureGlobal();
    }
    return null;
  }
  // =====================================================
  // 浇水
  // =====================================================
  function useWater(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    if (inventory.get("water") < 1) {
      console.log("❌ 水不足");
      return;
    }
    inventory.remove("water", 1);
    soil.addWater(e.x, e.y);
  }

  function getWater(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    return soil.getWater(e.x, e.y);
  }

  // =====================================================
  // 施肥
  // =====================================================
  function useFertilizer(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    if (inventory.get("fertilizer") < 1) {
      console.log("❌ 肥料不足");
      appendSystemLog("❌ 肥料不足");
      return;
    }
    inventory.remove("fertilizer", 1);
    cropManager.applyFertilizer(e.x, e.y);
  }

  // =====================================================
  // 种植
  // =====================================================
  function plant(type, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    if (mazeManager.isInMaze(e.x, e.y)) return;
    if (cropManager.exist(e.x, e.y)) return;

    // 成本检查
    if (CROP_TYPES[type].cost) {
      for (const item in CROP_TYPES[type].cost) {
        const need = CROP_TYPES[type].cost[item];
        if (inventory.get(item) < need) {
          console.log(`❌ 材料不足：${item} ${need}`);
          appendSystemLog(`❌ 材料不足：${item} ${need}`);
          return;
        }
      }

      for (const item in CROP_TYPES[type].cost) {
        inventory.remove(item, CROP_TYPES[type].cost[item]);
      }
    }

    let matureTime = CROP_TYPES[type]?.time || 0;
    if (!soil.gridIsWet(e.x, e.y)) matureTime *= 1.5;

    const crop = new Crop({
      type,
      plantedAt: Date.now(),
      matureTime,
      key: `${e.x}_${e.y}`,
    });

    // 按科技倍率调整产量
    const mul = unlock.getAbilityValue(CROP_TYPES[type].unlock, "产量倍率", 1);
    if (mul !== 1) crop.setYieldMultiplier(mul);

    cropManager.set(crop);
  }

  // =====================================================
  // 收获判断
  // =====================================================
  function canHarvest(id) {
    const e = entityManager.getEntity(id);
    if (!e) return false;

    if (mazeManager.isInMaze(e.x, e.y)) return false;

    const crop = cropManager.get(e.x, e.y);
    if (!crop) return false;

    return Date.now() - crop.plantedAt >= crop.matureTime;
  }

  function canMove(direction, id) {
    // d "up" "down" "left" "right"
    const e = entityManager.getEntity(id);
    if (!e) return false;
    const maze = mazeManager.isInMaze(e.x, e.y);
    if (maze) {
      if (!maze.canMove(e.x, e.y, direction)) return false;
    }
    return true;
  }

  function clear(id) {
    app.resetGame();
  }
  // =====================================================
  // 收获
  // =====================================================
  function harvest(id) {
    const e = entityManager.getEntity(id);
    if (!e) return false;

    if (mazeManager.isInMaze(e.x, e.y)) return false;

    const crop = cropManager.get(e.x, e.y);
    if (!crop) return false;

    if (Date.now() - crop.plantedAt < crop.matureTime) return false;

    const item = CROP_TYPES[crop.type].item;

    // 合并区域收割
    if (crop.mergeArea) {
      const { x, y, n } = crop.mergeArea;
      let total = 0;

      for (let dx = 0; dx < n; dx++) {
        for (let dy = 0; dy < n; dy++) {
          const c = cropManager.get(x + dx, y + dy);
          if (!c) continue;
          total += c.finalYield;
          cropManager.delete(x + dx, y + dy);
        }
      }
      inventory.add(item, total);
      return true;
    }

    // 单格收割
    inventory.add(item, crop.finalYield);
    cropManager.delete(e.x, e.y);
    return true;
  }

  // =====================================================
  // 分身创建
  // =====================================================
  function spawn(id) {
    const count = entityManager.getCount();

    const limit = unlock.getAbilityValue(
      CONSTANTS.UNLOCKS.Megafarm,
      "spawn并发数量",
      0
    );
    if (count >= limit) {
      console.log("❌ 分身数量已达上限");
      appendSystemLog("❌ 分身数量已达上限");
      return null;
    }
    return entityManager.spawn(entityManager.activeId).id;
  }

  function getMaxEntityCount() {
    return unlock.getAbilityValue(
      CONSTANTS.UNLOCKS.Megafarm,
      "spawn并发数量",
      1
    );
  }
  function getEntityCount() {
    return entityManager.getCount();
  }

  function numItems(itemType) {
    return inventory.get(itemType);
  }

  function despawn(id) {
    entityManager.despawn(id);
  }

  function setActive(id) {
    entityManager.setActive(id);
  }

  // =====================================================
  // 科技树编码能力解锁
  // =====================================================
  function loadCodingFeatures() {
    return unlock.loadCodingFeatures();
  }

  // =====================================================
  // 迷宫
  // =====================================================
  function createMaze(size, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    mazeManager.createMaze(e.x, e.y, size);
    app.renderAllMazes(); // 只画一次
  }

  // =====================================================
  // 改变角色
  // =====================================================
  function changeCharacter(type, id) {
    const key = String(type).trim().toLowerCase();
    const map = {
      drone: "drone",
      无人机: "drone",
      dino: "dino",
      恐龙: "dino",
      snake: "snake",
    };

    if (!map[key]) return;

    if (map[key] === "snake") {
      app.enterSnakeMode?.();
      return;
    }

    if (app.gameState.mode === "snake") {
      app.exitSnakeMode?.(map[key]);
      return;
    }

    const e = entityManager.getEntity(id);
    if (!e) return;
    e.type = map[key];
  }

  // =====================================================
  // 地图大小
  // =====================================================
  function setWorldSize(size) {
    app.setWorldSize?.(size);
  }

  // =====================================================
  // API 导出
  // =====================================================
  return {
    move,
    plant,
    harvest,
    canHarvest,
    spawn,
    despawn,
    setActive,
    till,
    useWater,
    getWater,
    useFertilizer,
    changeCharacter,
    getWorldSize,
    getTileSize,
    setWorldSize,
    createMaze,
    loadCodingFeatures,
    getGroundType,
    getCropType,
    canMove,
    clear,
    getMaxEntityCount,
    getEntityCount,
    numItems,
    measure,
  };
}
