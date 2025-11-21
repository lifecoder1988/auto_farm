"use client";

// ⭐ 注意：此文件必须在客户端执行，否则会报 window is not defined ⭐

import { setupEditor } from "./editor/editor.js";
import { setupPixi } from "./pixi/pixi.js";
import { setupSystems } from "./systems/systems.js";
import { setupUI } from "./ui/ui.js";
import { createGameAPI } from "./api/api.js";

import { drawGrid, rebuildWorld, setWorldSize } from "./world/world.js";

import { setupLoop } from "./loop/loop.js";
import { setupRunner } from "./runner/runner.js";

import { collectSaveData, restoreGameState } from "./save/save.js";

import { setupReset } from "./reset/reset.js";

import {
  saveSlotData,
  loadSlotMetaList,
  saveSlotMetaList,
} from "./ui/save-ui.js";

import { renderAllMazes } from "./engine/maze/renderMaze.js";
import { alertModal } from "./ui/alert.js";

export function initGame({ saveData, slotId, slotName }) {
  // ---- app 使用 Proxy 封装 ----
  const raw = {};
  const app = new Proxy(raw, {
    get(target, key) {
      // 优先从自身取
      if (key in target) return target[key];

      // 再从 pixi 中取
      if (target.pixi && key in target.pixi) {
        return target.pixi[key];
      }

      return undefined;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });

  app.currentSlotId = slotId;
  app.currentSlotName = slotName;

  // 初始化 UI 显示
  const slotLabel = document.getElementById("current-save-slot");
  if (slotLabel) {
    slotLabel.textContent = "当前存档：" + slotName;
  }

  app.pendingFrameReqs = [];

  console.log("restore save data:", saveData);

  // ---------------- 逐步初始化游戏系统 ----------------
  setupEditor(app, saveData);
  setupPixi(app, saveData);
  setupSystems(app, saveData);
  setupUI(app);
  setupReset(app);

  // 创建 API
  app.api = createGameAPI(app);

  // 公开公共函数给 UI 调用
  app.drawGrid = () => drawGrid(app);
  app.rebuildWorld = () => rebuildWorld(app);
  app.setWorldSize = (size) => setWorldSize(app, size);

  app.collectSaveData = () => collectSaveData(app);
  app.restoreGameState = (data) => restoreGameState(app, data);

  app.getEntity = (id) => ({ ...app.entityManager.getEntity(id) });
  app.getPlayer = () => ({ ...app.entityManager.getActive() });

  app.renderAllMazes = () => renderAllMazes(app);

  // Runner + Loop
  setupRunner(app);
  setupLoop(app);

  // 初始绘制网格
  app.drawGrid();

  // ---------------- 存档系统 ----------------
  app.saveCurrentSlot = async function () {
    const metaList = loadSlotMetaList();

    if (!app.currentSlotId) {
      await alertModal("提示", "当前没有选择存档槽，无法保存！");
      return;
    }

    const slot = metaList.find((m) => m.id === app.currentSlotId);
    if (!slot) {
      await alertModal("提示", "存档槽不存在！");
      return;
    }

    const data = collectSaveData(app);
    console.log("save data", data);

    slot.savedAt = Date.now();
    saveSlotData(slot.id, data);
    saveSlotMetaList(metaList);

    await alertModal("提示", `已保存到 “${slot.name}”`);
  };

  return app;
}
