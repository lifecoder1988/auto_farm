// js/game/runner.js
import { handleWorkerCallFactory } from "../engine/worker-bridge.js";
import CONSTANTS from "../engine/core/constants.js";

/**
 * 负责运行用户代码的 worker 初始化、中止、回调绑定
 */
export function setupRunner(app) {

  // ⭐ 必须提前初始化（避免 undefined）
  if (!app.pendingFrameReqs) app.pendingFrameReqs = [];

  app.worker = null;
  app.isRunning = false;
  app.runTimeoutMs = 600000; // 默认 10 分钟

  const editor = app.editor;
  const msg = app.msg;

  /**
   * 设置运行状态 + 按钮状态
   */
  function setRunning(v) {
    app.isRunning = v;

    // UI：按钮文案用 updateRunButton
    if (app.updateRunButton) {
      app.updateRunButton(v);
    }

    msg.textContent = v ? "运行中…" : "已就绪";
  }

  /**
   * 中止运行
   */
  function abortRun() {
    try {
      if (app.worker) {
        app.worker.terminate();
        app.worker = null;      // ⭐ 必须清空 app.worker
      }
    } catch {}

    if (app.runTimeoutHandle) clearTimeout(app.runTimeoutHandle);

    setRunning(false);
    msg.textContent = "运行已中止 ⛔";
  }

  /**
   * 运行用户代码（主要入口）
   */
  function runUserCode() {
    if (!editor) return;

    const code = editor.getValue();

    // 旧 worker 关闭
    if (app.worker) {
      app.worker.terminate();
      app.worker = null;
    }

    // ================================
    // ⭐ 创建新 worker → 赋值给 app.worker
    // ================================
    app.worker = new Worker("./js/worker.js");

    // 通知 worker 初始化常量
    app.worker.postMessage({
      type: "init_constants",
      constants: CONSTANTS,
    });

    setRunning(true);
    msg.textContent = "运行中…";

    // ====================================================
    // ⭐ handleWorkerCall 现在能正确使用 app.worker
    // ====================================================
    const handleWorkerCall = handleWorkerCallFactory(app);

    // ====================================================
    // Worker 消息回调（主逻辑）
    // ====================================================
    app.worker.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      switch (data.type) {
        case "call":
          handleWorkerCall(data, app.worker);
          break;

        case "log":
          app.appendLog?.(data.args || []);
          break;

        case "complete":
          if (app.runTimeoutHandle) clearTimeout(app.runTimeoutHandle);
          setRunning(false);
          msg.textContent = "运行完成";
          break;

        case "error":
          if (app.runTimeoutHandle) clearTimeout(app.runTimeoutHandle);
          setRunning(false);
          msg.textContent = "代码错误: " + data.error;
          break;
      }
    };

    // 发送 run 指令
    app.worker.postMessage({
      type: "run",
      code,
    });

    // ====================================================
    // Timeout
    // ====================================================
    if (app.runTimeoutMs > 0) {
      app.runTimeoutHandle = setTimeout(() => {
        abortRun();
        msg.textContent = "运行超时";
      }, app.runTimeoutMs);
    }
  }

  // UI 使用的接口
  app.runUserCode = runUserCode;
  app.abortRun = abortRun;

  // 绑定按钮事件（供 setupUI 使用）
  app.setRunHandlers?.(
    () => runUserCode(),
    () => abortRun()
  );
}
