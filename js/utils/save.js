import { saveToSlot ,loadFromSlot} from "./multi-save.js";

export function saveGame(app, slotId) {
  const data = {
    version: 1,
    world: { size: app.state.worldSize, tileSize: app.state.tileSize },
    character: exportCharacter(app),
    inventory: { items: app.inventory.items },
    crops: app.cropManager.export(),
    unlocks: {
      techLevels: app.unlockManager.techLevels,
      unlocks: app.unlockManager.unlocks,
    },
    maze: app.mazeManager?.export?.() || null,
    time: Date.now(),
  };

  saveToSlot(slotId, data);
  console.log("💾 存档已保存到槽位：", slotId);
}

export function loadGame(app, slotId) {
  const data = loadFromSlot(slotId);
  if (!data) {
    console.warn("⚠️ 该槽位没有存档", slotId);
    return false;
  }

  app.reset(); // 清空世界（推荐你实现）

  // --- 以下是恢复流程 ---
  app.setWorldSize(data.world.size);

  if (data.character) {
    const { id, type, x, y } = data.character;
    app.characterManager.spawn(type, x, y, id);
  }

  app.inventory.items = { ...data.inventory.items };

  app.cropManager.clear();
  data.crops.forEach((c) => {
    app.cropManager.plant(c.x, c.y, c.type, c.plantedAt);
  });

  app.unlockManager.techLevels = { ...data.unlocks.techLevels };
  app.unlockManager.unlocks = { ...data.unlocks.unlocks };

  if (data.maze && app.mazeManager?.import) {
    app.mazeManager.import(data.maze);
  }

  console.log("📂 已加载存档：", slotId);
  return true;
}