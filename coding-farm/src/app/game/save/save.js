// js/game/save.js
import { Crop } from "../engine/crops/Crop.js";

/**
 * 收集当前游戏状态，生成一个可存储的 JSON
 */
export function collectSaveData(app) {
  const crops = app.cropManager.export
    ? app.cropManager.export()
    : [];
  
  return {
    version: 1,

    // 编辑器代码
    editor: {
      code: app.editor?.getValue() || "",
    },

    // 世界配置
    world: {
      size: app.gameState.world.size,
    },

    // 角色 / 实体
    player: {
      activeId: app.entityManager.activeId,
      entities: app.entityManager.getAll().map((e) => ({
        id: e.id,
        x: e.x,
        y: e.y,
        type: e.type,
        hat: e.hat,
      })),
    },

    // 背包
    inventory: app.inventory.getAll(),

    // 科技解锁
    unlocks: {
      unlocks: { ...app.unlockManager.unlocks },
      techLevels: { ...app.unlockManager.techLevels },
    },

    // 作物（用 all() 导出，不再用 export()）
    crops: crops.map((c) => ({
      type: c.type,
      x: c.x,
      y: c.y,
      plantedAt: c.plantedAt,
      matureTime: c.matureTime,
      yieldMultiplier: c.yieldMultiplier ?? 1,
      mergeArea: c.mergeArea || null, // 可选：正方形合并区域
    })),

    // 土地状态（如果暂时没有 dump，可以先不存）
    // soil: app.soilManager.dump ? app.soilManager.dump() : null,
  };
}

/**
 * 将存档数据应用到当前 app
 */
export function restoreGameState(app, save) {
  if (!save) return;

  // 1. 编辑器代码
  if (save.editor?.code && app.editor) {
    app.editor.setValue(save.editor.code, -1);
  }

  // 2. 世界大小
  if (save.world?.size) {
    app.gameState.setWorldSize(save.world.size, app.view.width);
  }

  // 3. 实体 / 角色
  app.entityManager.reset();
  if (save.player) {
    if (Array.isArray(save.player.entities)) {
      save.player.entities.forEach((e) => {
        // 你可以实现 spawnFromData，或者直接用已有 spawn 再改属性
        const id = app.entityManager.spawn(app.entityManager.activeId).id;
        const ent = app.entityManager.getEntity(id);
        ent.x = e.x;
        ent.y = e.y;
        ent.type = e.type || "drone";
        ent.hat = e.hat;
      });
    }
    if (typeof save.player.activeId === "number") {
      app.entityManager.setActive(save.player.activeId);
    }
  }

  // 4. 背包
  if (save.inventory) {
    app.inventory.setAll
      ? app.inventory.setAll(save.inventory)
      : Object.entries(save.inventory).forEach(([k, v]) =>
          app.inventory.set(k, v)
        );
  }

  // 5. 科技解锁
  if (save.unlocks) {
    app.unlockManager.unlocks = save.unlocks.unlocks || {};
    app.unlockManager.techLevels = save.unlocks.techLevels || {};
  }

  // 6. 作物
  app.cropManager.import(save.crops || []);
  

  // 7. 土地状态（如果以后实现 SoilManager.dump/restore 再打开）
  // if (save.soil && app.soilManager?.restore) {
  //   app.soilManager.restore(save.soil);
  // }
}
