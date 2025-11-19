// js/game/loop.js
import CONSTANTS from "../engine/core/constants.js";
import { drawMapFrame } from "../engine/map.js";

/**
 * 初始化游戏主循环（动画帧）
 */
export function setupLoop(app) {
  let lastTickTime = performance.now();
  let accumulated = 0;

  const ticker = app.ticker;

  ticker.add(() => {
    const now = performance.now();
    const dt = now - lastTickTime;
    lastTickTime = now;
    accumulated += dt;

    // ======================
    // 每秒 tick（资源产出）
    // ======================
    if (accumulated >= 1000) {
      accumulated -= 1000;

      // 水资源自动产出
      const waterGain = app.unlockManager.getAbilityValue(
        CONSTANTS.UNLOCKS.Watering,
        "水资源每秒产出",
        0
      );
      app.inventory.add("water", waterGain);

      // 肥料产出（科技解锁）
      if (app.unlockManager.isUnlocked(CONSTANTS.UNLOCKS.Fertilizer)) {
        app.inventory.add("fertilizer", 1);
      }
    }

    // ======================
    // 模式：贪吃蛇（snake）
    // ======================
    if (app.gameState.mode === "snake") {
      app.snakeGame?.render?.();
      return;
    }

    // ======================
    // 土地系统更新（湿度变化 / 肥料倍率）
    // ======================
    if (app.soilManager) {
      const mul = app.unlockManager.getAbilityValue(
        CONSTANTS.UNLOCKS.Grass,
        "产量倍率",
        1
      );
      app.soilManager.update(app.cropManager, { mul });
    }

    // ======================
    // 作物系统更新（成熟、动画、merge）
    // ======================
    app.cropManager.updateCrops();

    // ======================
    // 世界渲染（土地 + 作物 + 实体）
    // ======================
    drawMapFrame({
      app,
      mapSize: app.gameState.world.size,
      tileSize: app.gameState.world.tileSize,
      crops: app.cropManager.all(),
      entities: app.entityManager.getAll(),
    });

    // ======================
    // Worker pending frame 动画回调
    // ======================
    flushWorkerPending(app);
  });
}

/**
 * 处理 worker 的 pendingFrameReqs
 */
function flushWorkerPending(app) {
  if (!app.pendingFrameReqs?.length || !app.worker) return;

  const reqs = app.pendingFrameReqs.splice(0);
  for (const id of reqs) {
    app.worker.postMessage({ type: "response", reqId: id, result: true });
  }
}