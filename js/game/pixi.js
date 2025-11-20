// js/game/pixi.js
import { GameState } from "../engine/core/GameState.js";
import { CropDebugRenderer } from "../engine/crops/CropDebugRenderer.js";

/**
 * 初始化 Pixi 应用、canvas 绑定、基本 gameState
 */
export function setupPixi(app, saveData = null) {
  const canvasEl = document.getElementById("map");
  const viewW = canvasEl?.width || 400;
  const viewH = canvasEl?.height || 400;

  const pixiApp = new PIXI.Application({
    width: viewW,
    height: viewH,
    backgroundAlpha: 0,
    antialias: true,
  });

  // 用 Pixi canvas 替换 DOM canvas
  pixiApp.view.id = "map";
  if (canvasEl?.parentNode) {
    canvasEl.parentNode.replaceChild(pixiApp.view, canvasEl);
  }

  // 绑定到 app
  app.pixi = pixiApp;
  app.view = pixiApp.view;
  app.ticker = pixiApp.ticker;

  // Debug 渲染器（正方形框）
  app.cropDebug = new CropDebugRenderer(app);

  // ================================
  // gameState 初始化
  // ================================
  const worldSize = saveData?.world?.size ?? 3;

  app.gameState = new GameState({
    worldSize,
    viewWidth: viewW,
  });

  // 按存档刷新 tileSize
  app.gameState.setWorldSize(worldSize, viewW);
}
