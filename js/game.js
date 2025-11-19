// game.js
import { initLayers, gridLayer } from "./engine/layers.js";
//import { initSoilLayer } from "./engine/soil.js";
import { SoilManager } from "./engine/soil/SoilManager.js";

import { drawMapFrame } from "./engine/map.js";
import { handleWorkerCallFactory } from "./engine/worker-bridge.js";

import { Inventory } from "./engine/inventory/Inventory.js";
import { CharacterManager } from "./engine/characters/CharacterManager.js";
import { EntityManager } from "./engine/entities/EntityManager.js";
import { CropManager } from "./engine/crops/CropManager.js";
import { Crop } from "./engine/crops/Crop.js";

import { GameState } from "./engine/core/GameState.js";

import { initUnlockUI } from "./engine/unlock/unlock-ui.js";
import { UnlockManager } from "./engine/unlock/UnlockManager.js";
import { TECH_TREE } from "./data/unlock.js";

import { SnakeGame } from "./engine/snake/SnakeGame.js";

import { Maze } from "./engine/maze/Maze.js";
import { MazeManager } from "./engine/maze/MazeManager.js";
import { renderAllMazes } from "./engine/maze/renderMaze.js";

import { DEFAULT_CODE } from './data/default_code.js';

import { appendLog } from "./ui/console.js";

import { CROP_TYPES } from "./engine/crops/CropManager.js";
import {
  detectSquaresUnique,
  applyMergeArea,
} from "./engine/crops/CropMerge.js";
import { CropEventBus } from "./engine/crops/CropEventBus.js";
import { CropDebugRenderer } from "./engine/crops/CropDebugRenderer.js";

import CONSTANTS from "./engine/core/constants.js";

export function initGame() {
  const msg = document.getElementById("msg");
  const inv = document.getElementById("inventory");


  const runBtn = document.getElementById("run");
  const timeoutInput = document.getElementById("timeout-ms");

  msg.textContent = "已就绪 ✅";

  // 编辑器
  const editor = ace.edit("editor");
  editor.setValue(DEFAULT_CODE, -1);
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/javascript");
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
  });

  // === 自定义游戏 API 自动补全 ===
  const customCompleter = {
    getCompletions(editor, session, pos, prefix, callback) {
      const list = [
        { caption: "till", value: "till()", meta: "game api" },
        {
          caption: "console.log(msg)",
          value: "console.log('hello world')",
          meta: "game api",
          docHTML:
            "<b>console.log(msg)</b><br/>打印消息到控制台。",
        },
        {
          caption: "move(dir)",
          value: "move('up')",
          meta: "game api",
          docHTML:
            "<b>move(dir)</b><br/>让角色在地图上移动。dir 是方向字符串（'up'/'down'/'left'/'right'）。",
        },

        {
          caption: "setWorldSize(size)",
          value: "setWorldSize(10)",
          meta: "game api",
          docHTML:
            "<b>setWorldSize(size)</b><br/>重设世界地图大小（会重绘地图）。",
        },

        {
          caption: "createMaze(n)",
          value: "createMaze(3)",
          meta: "game api",
          docHTML:
            "<b>createMaze(n)</b><br/>创建迷宫结构，n 是迷宫大小（整数）。",
        },

        {
          caption: "plant(type)",
          value: "plant('土豆')",
          meta: "game api",
          docHTML: "<b>plant(type)</b><br/>种植作物。支持：'土豆'、'南瓜'。",
        },

        {
          caption: "harvest()",
          value: "harvest()",
          meta: "game api",
          docHTML: "<b>harvest()</b><br/>收获成熟作物，未成熟不会有任何效果。",
        },

        {
          caption: "changeCharacter(type)",
          value: "changeCharacter('dino')",
          meta: "game api",
          docHTML:
            "<b>changeCharacter(type)</b><br/>切换角色外形。示例：'dino'、'drone'、'snake'。切换到'snake'会进入贪吃蛇模式。",
        },

        {
          caption: "spawn(async ({ move, plant, harvest, id }) => {})",
          meta: "snippet",
          value: `spawn(async ({ move, plant, harvest, id }) => {
  await move(0, 1)
  await plant('土豆')
  await harvest()
})`,
          docHTML:
            "<b>spawn(callback)</b><br/>创建一个分身（可并行运行）。<br/>回调参数包含 move/plant/harvest。（贪吃蛇模式下不可用）",
        },
      ];

      callback(null, list);
    },
  };

  ace.require("ace/ext/language_tools").addCompleter(customCompleter);
  // Pixi 初始化
  const canvasEl = document.getElementById("map");
  const viewW = canvasEl?.width || 400;
  const viewH = canvasEl?.height || 400;

  const app = new PIXI.Application({
    width: viewW,
    height: viewH,
    backgroundAlpha: 0,
    antialias: true,
  });

  app.cropDebug = new CropDebugRenderer(app);

  CropEventBus.on("crop:mature", () => {
    const size = app.gameState.world.size;

    // 计算正方形区域
    const squares = detectSquaresUnique(app.cropManager, size);

    // 写 mergeArea
    squares.forEach((area) => applyMergeArea(app.cropManager, area));

    // debug 边框渲染
    app.cropDebug.drawSquares(squares);
  });

  CropEventBus.on("crop:harvest:merged", () => {
    const size = app.gameState.world.size;

    // 计算正方形区域
    const squares = detectSquaresUnique(app.cropManager, size);

    // 写 mergeArea
    squares.forEach((area) => applyMergeArea(app.cropManager, area));

    // debug 边框渲染
    app.cropDebug.drawSquares(squares);
  });


  // ⭐ GameState（核心）
  app.gameState = new GameState({
    worldSize: 3,
    viewWidth: viewW,
  });

  // 替换原 canvas
  app.view.id = "map";
  if (canvasEl?.parentNode) {
    canvasEl.parentNode.replaceChild(app.view, canvasEl);
  }

  // ⭐ Inventory（背包）
  app.inventory = new Inventory({
    potato: 1000,
    peanut: 1000,
    pumpkin: 1000,
    straw: 1000,
    gold: 0,
    apple: 0,
    hay: 1000,
    wood: 1000,
    carrot: 1000,
    cactus: 1000,
    sunflower: 1000,

  });
  app.inventory.onChange(() => updateInventory());

  // ⭐ EntityManager
  const entityManager = new EntityManager();
  entityManager.initDefault();
  app.entityManager = entityManager;

  // ⭐ CharacterManager（渲染角色）
  app.characterManager = new CharacterManager();

  // ⭐ CropManager（渲染作物）
  app.cropManager = new CropManager();
  app.cropManager.updateConfig(
    app.gameState.world.size,
    app.gameState.world.tileSize
  );
  // ⭐ UnlockManager（科技树）
  app.unlockManager = new UnlockManager({
    inventory: app.inventory,
    techLevels: {},
    unlocks: {},
    techTree: TECH_TREE,
  });

  app.mazeManager = new MazeManager(app);

  // 初始化科技 UI
  initUnlockUI(app, TECH_TREE);

  // 初始化图层
  const layers = initLayers(app);
  app.layers = layers;

  // 土地层
  /*initSoilLayer({
    mapSize: app.gameState.world.size,
    tileSize: app.gameState.world.tileSize,
    url: "asset/image/soil.png",
    soilLayer: layers.soilLayer,
  });*/
  const soilTextures = {
    normal: PIXI.Texture.from("asset/image/dry.png"),
    tilled: PIXI.Texture.from("asset/image/soil.png"),
  };
  app.soilManager = new SoilManager({
    mapSize: app.gameState.world.size,
    tileSize: app.gameState.world.tileSize,
    soilLayer: app.layers.soilLayer,
    textures: soilTextures,
  });

  // 画网格
  drawGrid();

  // Worker 相关
  let worker = null;
  let runTimeoutHandle = null;
  let runTimeoutMs = 600000;
  const pendingFrameReqs = [];
  let isRunning = false;

  // =======================
  // 工具函数
  // =======================
  function drawGrid() {
    const size = app.gameState.world.size;
    const tile = app.gameState.world.tileSize;

    gridLayer.clear();
    gridLayer.lineStyle(1, 0x555555, 1);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        gridLayer.drawRect(x * tile, y * tile, tile, tile);
      }
    }
  }

  function createMaze(size, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    app.mazeManager.createMaze(e.x, e.y, size);
    renderAllMazes(app); // 只画一次
  }

  function getWorldSize() {
    return app.gameState.world.size;
  }

  function getTileSize() {
    return app.gameState.world.tileSize;
  }

  function setWorldSize(size) {
    app.gameState.setWorldSize(size, app.view.width);
    rebuildWorld();
  }



  function updateInventory() {
    const t = app.inventory.getAll();
    console.log(t);
    inv.textContent = `🎒 背包: 草料(${t.hay}) 木材(${t.wood}) 胡萝卜(${t.carrot})  南瓜(${t.pumpkin})  仙人掌(${t.cactus}) 金币(${t.gold}) 苹果(${t.apple}) 向日葵(${t.sunflower})`;
  }

  // =======================
  // 农场逻辑：move / plant / harvest / spawn / despawn
  // =======================
  function move(direction, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    const maze = app.mazeManager.isInMaze(e.x, e.y);
    if (maze) {
      if (!maze.canMove(e.x, e.y, direction)) return false;

      entityManager.move(direction, getWorldSize(), id);

      const treasure = maze.getTreasureGlobal();
      if (treasure.x === e.x && treasure.y === e.y) {
        const reward = maze.getTreasureReward();
        app.inventory.add("gold", reward);

        app.mazeManager.deleteMaze(maze);
        renderAllMazes(app);

        console.log("宝藏已收集，迷宫删除，奖励:", reward);
      }
      return;
    }

    return entityManager.move(direction, getWorldSize(), id);
  }


  function till(id) {
    // 如果没初始化 soilManager 就返回
    if (!app.soilManager) return;

    const e = entityManager.getEntity(id);
    if (!e) return;
    // 将该格变成耕地
    app.soilManager.till(e.x, e.y);


  }

  function plant(type, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    if (app.mazeManager.isInMaze(e.x, e.y)) return; // 不能在迷宫中种植
    if (app.cropManager.exist(e.x, e.y)) return;
    const existing = app.cropManager.get(e.x, e.y);
    if (existing) return;

    if (CROP_TYPES[type].cost) {
      const cost = CROP_TYPES[type].cost;
      for (const item in cost) {
        const need = cost[item];
        if (app.inventory.get(item) < need) {
          console.log(`❌ 材料不足：${item} ${need}`);
          return; // ❌ 有一个材料不足，直接返回，不扣任何东西
        }
      }

      // 2. 所有材料足够，执行扣除
      for (const item in cost) {
        const need = cost[item];
        app.inventory.remove(item, need);
      }
    }
    const crop = new Crop({
      type,
      plantedAt: Date.now(),
      matureTime: CROP_TYPES[type]?.time || 0,
      key: `${e.x}_${e.y}`,
    });


    
    if (type === CROP_TYPE_NAMES.Cactus) {
      const mul = unlockMgr.getAbilityValue(CONSTANTS.UNLOCKS.Cactus, "产量倍率", 1);
      crop.setYieldMultiplier(mul);
    } else if (type === CROP_TYPE_NAMES.Carrots){
      const mul = unlockMgr.getAbilityValue(CONSTANTS.UNLOCKS.Carrots, "产量倍率", 1);
      crop.setYieldMultiplier(mul);
    } else if(type === CROP_TYPE_NAMES.Pumpkins){
      const mul = unlockMgr.getAbilityValue(CONSTANTS.UNLOCKS.Pumpkins, "产量倍率", 1);
      crop.setYieldMultiplier(mul);
    } else if (type === CROP_TYPE_NAMES.Sunflowers){
      console.log("no sunflower mul")
    } else if (type === CROP_TYPE_NAMES.Trees){
      const mul = unlockMgr.getAbilityValue(CONSTANTS.UNLOCKS.Trees, "产量倍率", 1);
      crop.setYieldMultiplier(mul);
    } else if (type === CROP_TYPE_NAMES.Grass){
      const mul = unlockMgr.getAbilityValue(CONSTANTS.UNLOCKS.Grass, "产量倍率", 1);
      crop.setYieldMultiplier(mul);
    } else if (type === CROP_TYPE_NAMES.Bush){
      const mul = unlockMgr.getAbilityValue(CONSTANTS.UNLOCKS.Trees, "产量倍率", 1);
      crop.setYieldMultiplier(mul);
    }

    app.cropManager.set(crop);
  }

  function canHarvest(id) {
    const e = entityManager.getEntity(id);
    if (!e) return false;
    if (app.mazeManager.isInMaze(e.x, e.y)) return;
    const crop = app.cropManager.get(e.x, e.y);
    if (!crop) return false;

    return Date.now() - crop.plantedAt >= crop.matureTime;
  }

  function harvest(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;
    if (app.mazeManager.isInMaze(e.x, e.y)) return; // 不能在迷宫中收获

    const crop = app.cropManager.get(e.x, e.y);
    if (!crop) return;

    const elapsed = Date.now() - crop.plantedAt;
    if (elapsed < crop.matureTime) return;

    const itemKey = CROP_TYPES[crop.type].item;
    const bonus = app.unlockManager.getLevel("pumpkin");

    // ========= 是否属于一个 mergeArea（正方形）============
    const area = crop.mergeArea;

    if (!area) {
      // ======== 普通单格收割 ========
      const qty = crop.finalYield
      console.log("qty", qty);
      app.inventory.add(itemKey, qty);
      app.cropManager.delete(e.x, e.y);

      return;
    }

    // ======== 整块合并收割（n*n）===========
    const { x: ax, y: ay, n } = area;

    let total = 0;

    for (let dx = 0; dx < n; dx++) {
      for (let dy = 0; dy < n; dy++) {
        const cx = ax + dx;
        const cy = ay + dy;

        const c = app.cropManager.get(cx, cy);
        if (!c) continue;

        total += c.finalYield;
        app.cropManager.delete(cx, cy);
      }
    }

    if (total > 0) {

      app.inventory.add(itemKey, total);
    }
    CropEventBus.broadcast("crop:harvest:merged");
  }

  function spawn() {
    return entityManager.spawn(entityManager.activeId).id;
  }

  function despawn(id) {
    entityManager.despawn(id);
    updateInventory();
  }

  function setActive(id) {
    entityManager.setActive(id);
    updateInventory();
  }

  // =======================
  // 世界重建
  // =======================
  function rebuildWorld() {
    const size = getWorldSize();
    const tile = getTileSize();

    app.cropManager.reset();
    app.cropManager.updateConfig(size, tile);

    gridLayer.clear();
    layers.soilLayer.removeChildren();
    layers.cropsLayer.removeChildren();
    layers.entitiesLayer.removeChildren();

    drawGrid();

    initSoilLayer({
      mapSize: size,
      tileSize: tile,
      url: "asset/image/soil.png",
      soilLayer: layers.soilLayer,
    });

    app.characterManager.clear();
    app.characterManager.update(entityManager.getAll(), size, tile);

    console.log("地图已重绘");
  }

  // =======================
  // 蛇模式
  // =======================
  function enterSnakeMode() {
    app.gameState.mode = "snake";

    app.cropManager.reset();

    layers.cropsLayer.removeChildren();
    layers.entitiesLayer.removeChildren();

    const e0 = entityManager.getById(0) || entityManager.getActive();

    app.snakeGame = new SnakeGame(app, getTileSize(), getWorldSize(), {
      startX: e0.x,
      startY: e0.y,
    });
  }

  function exitSnakeMode(type = "drone") {
    const head = app.snakeGame.model.body[0];
    const e0 = entityManager.getById(0);

    if (e0 && head) {
      e0.x = head.x;
      e0.y = head.y;
      e0.type = type;
    }

    if (app.snakeGame?.renderer) {
      app.snakeGame.renderer.destroy();
    }

    app.snakeGame = null;
    app.gameState.mode = "farm";

    layers.cropsLayer.removeChildren();
    layers.entitiesLayer.removeChildren();
  }

  // =======================
  // 角色切换
  // =======================
  function changeCharacter(typeKey, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    const key = String(typeKey).trim().toLowerCase();
    const map = {
      drone: "drone",
      无人机: "drone",
      dino: "dino",
      恐龙: "dino",
      snake: "snake",
    };

    const nextType = map[key];
    if (!nextType) return;

    if (nextType === "snake") {
      enterSnakeMode();
      return;
    }
    if (app.gameState.mode === "snake") {
      exitSnakeMode(nextType);
      return;
    }

    e.type = nextType;
  }


  function loadCodingFeatures() {
    return app.unlockManager.loadCodingFeatures();
  }
  // =======================
  // 重置
  // =======================
  function reset() {
    abortRun();
    app.mazeManager.deleteAll();

    entityManager.reset();

    app.cropManager.reset();

    app.cropDebug.clear();
    msg.textContent = "已重置 ⟳";
    updateInventory();
  }

  // =======================
  // Worker 回调
  // =======================
  const handleWorkerCall = handleWorkerCallFactory({
    move,
    plant,
    harvest,
    canHarvest,
    spawn,
    despawn,
    setActive,
    getEntity: (id) => ({ ...entityManager.getEntity(id) }),
    getPlayer: () => ({ ...entityManager.getActive() }),
    pendingFrameReqs,
    app,
    msg,
    changeCharacter,
    getWorldSize,
    getTileSize,
    setWorldSize,
    createMaze,
    loadCodingFeatures,
    till,
  });

  // =======================
  // Worker 执行用户代码
  // =======================
  function setRunning(v) {
    isRunning = v;
    runBtn.textContent = v ? "中止" : "运行";
  }

  function abortRun() {
    try {
      worker?.terminate();
    } catch { }
    worker = null;

    if (runTimeoutHandle) clearTimeout(runTimeoutHandle);

    setRunning(false);
    msg.textContent = "运行已中止 ⛔";
  }

  function runUserCode() {
    msg.textContent = "运行中…";
    setRunning(true);

    const code = editor.getValue();

    if (worker) worker.terminate();
    worker = new Worker("./js/runner.js");
    worker.postMessage({ type: 'init_constants', constants: CONSTANTS });
    worker.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      if (data.type === "call") {
        handleWorkerCall(data, worker);
      } else if (data.type === "log") {
        appendLog(data.args || []);
      } else if (data.type === "complete") {
        clearTimeout(runTimeoutHandle);
        setRunning(false);
        msg.textContent = "运行完成";
      } else if (data.type === "error") {
        clearTimeout(runTimeoutHandle);
        setRunning(false);
        msg.textContent = "代码错误: " + data.error;
      }
    };

    worker.postMessage({ type: "run", code });

    if (runTimeoutMs > 0) {
      runTimeoutHandle = setTimeout(() => {
        abortRun();
        msg.textContent = "运行超时";
      }, runTimeoutMs);
    }
  }


  // =======================
  // 动画循环
  // =======================
  function animate() {


    if (app.gameState.mode === "snake") {
      app.snakeGame.render && app.snakeGame.render();
      return;
    }

    if (app.soilManager) {
      const mul = app.unlockManager.getAbilityValue(CONSTANTS.UNLOCKS.Grass, "产量倍率", 1);
      app.soilManager.update(app.cropManager,{mul});
    }

    app.cropManager.updateCrops();

    drawMapFrame({
      app,
      mapSize: getWorldSize(),
      tileSize: getTileSize(),
      crops: app.cropManager.all(),
      entities: entityManager.getAll(),
    });

    if (pendingFrameReqs.length && worker) {
      const reqs = pendingFrameReqs.splice(0);
      for (const id of reqs) {
        worker.postMessage({ type: "response", reqId: id, result: true });
      }
    }
  }

  // =======================
  // 事件绑定
  // =======================
  runBtn.addEventListener("click", () => {
    if (isRunning) abortRun();
    else runUserCode();
  });

  document.getElementById("reset").addEventListener("click", reset);

  /*techToggleBtn.addEventListener("click", () => {
    techOverlay.style.display = "flex";
  });

  techCloseBtn.addEventListener("click", () => {
    techOverlay.style.display = "none";
  });*/

  timeoutInput.value = String(runTimeoutMs);
  timeoutInput.addEventListener("change", () => {
    const v = parseInt(timeoutInput.value);
    if (v >= 0) {
      runTimeoutMs = v;
    }
  });

  updateInventory();
  app.ticker.add(animate);
}
