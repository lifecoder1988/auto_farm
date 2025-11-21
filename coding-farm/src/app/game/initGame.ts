// src/game/initGame.ts
"use client";

import { setupEditor } from "./editor/editor";
import { setupPixi } from "./pixi/pixi";
import { setupSystems } from "./systems/systems";

import { createGameAPI } from "./api/api";
import { drawGrid, rebuildWorld, setWorldSize } from "./world/world";
import { setupLoop } from "./loop/loop";
import { setupRunner } from "./runner/runner";
import { collectSaveData, restoreGameState } from "./save/save";
import { setupReset } from "./reset/reset";
import {
  saveSlotData,
  loadSlotMetaList,
  saveSlotMetaList,
} from "@/utils/storage"; // 原来在 ui/save-ui.js 里的那几个函数
import { renderAllMazes } from "./engine/maze/renderMaze";
import type { UiBridge } from "./types";

export interface InitGameOptions {
  saveData: any;
  slotId: number;
  slotName: string;
  ui: UiBridge;
}

export async function initGame({
  saveData,
  slotId,
  slotName,
  ui,
}: InitGameOptions) {
  // ---- app 使用 Proxy 封装 ----
  const raw: any = {};
  const app: any = new Proxy(raw, {
    get(target, key) {
      if (key in target) return (target as any)[key];
      if (target.pixi && key in target.pixi) return (target.pixi as any)[key];
      return undefined;
    },
    set(target, key, value) {
      (target as any)[key] = value;
      return true;
    },
  });

  app.currentSlotId = slotId;
  app.currentSlotName = slotName;
  app.ui = ui; // ⭐ 把 React 注入进来的 alert/confirm 挂上去

  // 初始化 UI 显示（存档名）
  const slotLabel = document.getElementById("current-save-slot");
  if (slotLabel) {
    slotLabel.textContent = "当前存档：" + slotName;
  }

  app.pendingFrameReqs = [];

  // ================= 游戏子系统初始化 =================
  await setupEditor(app, saveData);
  setupPixi(app, saveData);
  setupSystems(app, saveData);

  setupReset(app);

  app.api = createGameAPI(app);

  app.drawGrid = () => drawGrid(app);
  app.rebuildWorld = () => rebuildWorld(app);
  app.setWorldSize = (size: number) => setWorldSize(app, size);

  app.collectSaveData = () => collectSaveData(app);
  app.restoreGameState = (data: any) => restoreGameState(app, data);

  app.getEntity = (id: string) => ({ ...app.entityManager.getEntity(id) });
  app.getPlayer = () => ({ ...app.entityManager.getActive() });

  app.renderAllMazes = () => renderAllMazes(app);

  setupRunner(app);
  setupLoop(app);

  app.drawGrid();

  // ================= 存档保存函数 =================
  app.saveCurrentSlot = async function () {
    const metaList = loadSlotMetaList();

    if (!app.currentSlotId) {
      await ui.alert("提示", "当前没有选择存档槽，无法保存！");
      return;
    }

    const slot = metaList.find((m: any) => m.id === app.currentSlotId);
    if (!slot) {
      await ui.alert("提示", "存档槽不存在！");
      return;
    }

    const data = collectSaveData(app);
    slot.savedAt = Date.now();

    saveSlotData(slot.id, data);
    saveSlotMetaList(metaList);

    await ui.alert("提示", `已保存到 “${slot.name}”`);
  };

  return app;
}
