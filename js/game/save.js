// js/game/save.js

/**
 * 采集当前游戏状态（序列化）
 */
export function collectSaveData(app) {
  return {
    version: 1,                       // 🔥 用于未来兼容
    savedAt: Date.now(),

    // -------- 编辑器代码 --------
    code: app.editor?.getValue() || "",

    // -------- 世界大小 --------
    worldSize: app.gameState.world.size,

    // -------- 背包 --------
    inventory: app.inventory.getAll(),

    // -------- 科技树状态 --------
    techLevels: { ...app.unlockManager.techLevels },
    unlocks: { ...app.unlockManager.unlocks },

    // -------- 实体系统 --------
    entities: JSON.parse(JSON.stringify(app.entityManager.entities)),
    activeId: app.entityManager.activeId,

    // -------- 作物系统 --------
    crops: app.cropManager.export(),

    // -------- 土壤系统 --------
    soil: app.soilManager.export(),

    // -------- 迷宫系统 --------
    mazes: app.mazeManager.export(),
  };
}


/**
 * 根据存档恢复 app 状态
 */
export function restoreGameState(app, data) {
  if (!data) return;

  // -------- 编辑器代码 --------
  if (app.editor && data.code) {
    app.editor.setValue(data.code, -1);
  }

  // -------- 世界大小 --------
  if (typeof data.worldSize === "number") {
    app.gameState.setWorldSize(data.worldSize, app.view.width);
  }

  // -------- 背包 --------
  if (data.inventory) {
    for (const k in data.inventory) {
      app.inventory.items[k] = data.inventory[k];
    }
    app.updateInventory?.();
  }

  // -------- 科技树 --------
  if (data.techLevels) {
    Object.assign(app.unlockManager.techLevels, data.techLevels);
  }
  if (data.unlocks) {
    Object.assign(app.unlockManager.unlocks, data.unlocks);
  }
  app.unlockManager.notify?.();

  // -------- 实体系统 --------
  if (data.entities) {
    app.entityManager.entities = data.entities;
    app.entityManager.activeId = data.activeId ?? 0;
  }

  // -------- 作物系统 --------
  if (data.crops) {
    app.cropManager.import(data.crops);
  }

  // -------- 土壤系统 --------
  if (data.soil) {
    app.soilManager.import(data.soil);
  }

  // -------- 迷宫系统 --------
  if (data.mazes) {
    app.mazeManager.import(data.mazes);
  }

  // -------- 重绘世界 --------
  app.rebuildWorld?.();

  console.log("存档已恢复 ✔");
}
