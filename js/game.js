// game.js

import { setupEditor } from "./game/editor.js";

import { setupPixi } from "./game/pixi.js";

import { setupSystems } from "./game/systems.js";

import { setupUI } from "./game/ui.js";

import { createGameAPI } from "./game/api.js";

import { drawGrid, rebuildWorld, setWorldSize } from "./game/world.js";

import { setupLoop } from "./game/loop.js";

import { setupRunner } from "./game/runner.js";

import { collectSaveData, restoreGameState } from "./game/save.js";
import { setupReset } from "./game/reset.js";

import { saveSlotData, loadSlotMetaList, saveSlotMetaList } from "./ui/save-ui.js";


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
  slotLabel.textContent = "当前存档：" + slotName;

  app.pendingFrameReqs = [];

  console.log(saveData)
  setupEditor(app, saveData);
  setupPixi(app, saveData);
  setupSystems(app, saveData);
  setupUI(app);
  setupReset(app);
  app.api = createGameAPI(app);
  

  console.log(app.pendingFrameReqs);
  // 挂到 app 供 API & UI 调用
  app.drawGrid = () => drawGrid(app);
  app.rebuildWorld = () => rebuildWorld(app);
  app.setWorldSize = (size) => setWorldSize(app, size);

  app.collectSaveData = () => collectSaveData(app);
  app.restoreGameState = (data) => restoreGameState(app, data);

  app.getEntity = (id) => ({ ...app.entityManager.getEntity(id) });
  app.getPlayer = () => ({ ...app.entityManager.getActive() });

  setupRunner(app);
  setupLoop(app);
  app.drawGrid();

  // ③ ⭐ 在末尾挂上 saveCurrentSlot
  app.saveCurrentSlot = function () {
    const metaList = loadSlotMetaList();

    if (!app.currentSlotId) {
      alert("当前没有选择存档槽，无法保存！");
      return;
    }

    const slot = metaList.find(m => m.id === app.currentSlotId);
    if (!slot) {
      alert("存档槽不存在！");
      return;
    }

    const data = collectSaveData(app);
    console.log(data)
    slot.savedAt = Date.now();
    saveSlotData(slot.id, data);
    saveSlotMetaList(metaList);

    alert(`已保存到 “${slot.name}”`);
  };
  return app;
}
