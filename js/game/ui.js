// js/game/ui.js

import { initUnlockUI } from "../engine/unlock/unlock-ui.js";
import { appendLog } from "../ui/console.js";

/**
 * 初始化 UI（按钮、消息、背包显示、科技树 UI、超时时间、控制台）
 */
export function setupUI(app) {
  const msg = document.getElementById("msg");
  const inv = document.getElementById("inventory");
  const runBtn = document.getElementById("run");
  const resetBtn = document.getElementById("reset");
  const timeoutInput = document.getElementById("timeout-ms");

  // 可供其他模块使用
  app.updateInventory = updateInventory;
  app.msg = msg;

  // ==========================
  // 背包渲染函数
  // ==========================
  function updateInventory() {
    const t = app.inventory.getAll();
    inv.textContent = `🎒 背包: 草料(${t.hay}) 木材(${t.wood}) 胡萝卜(${t.carrot}) 南瓜(${t.pumpkin}) 仙人掌(${t.cactus}) 金币(${t.gold}) 苹果(${t.apple}) 向日葵(${t.sunflower}) 水(${t.water}) 肥料(${t.fertilizer})`;
  }

  updateInventory();

  // ==========================
  // 科技树 UI
  // ==========================
  initUnlockUI(app, app.unlockManager.techTree);

  // ==========================
  // run 按钮（由 setupRunner 接管）
  // 提供 app.setRunHandlers()
  // ==========================
  app.setRunHandlers = (onRun, onAbort) => {
    runBtn.addEventListener("click", () => {
      if (app.isRunning) {
        onAbort();
      } else {
        onRun();
      }
    });
  };

  app.updateRunButton = () => {
    const runBtn = document.getElementById("run");
    runBtn.textContent = app.isRunning ? "中止" : "运行";
  };
  // ==========================
  // reset 按钮
  // ==========================
  resetBtn.addEventListener("click", () => {
    app.resetGame?.();
  });

  // ==========================
  // 超时设置
  // ==========================
  timeoutInput.addEventListener("change", () => {
    const v = parseInt(timeoutInput.value);
    if (v >= 0) app.runTimeoutMs = v;
  });

  // ==========================
  // 控制台自动滚动
  //（appendLog 已经处理 scroll）
  // ==========================
  app.appendLog = appendLog;

  // 显示 UI 就绪
  msg.textContent = "已就绪 ✅";
}
