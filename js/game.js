// game.js
import { initLayers, gridLayer } from './engine/layers.js';
import { initSoilLayer } from './engine/soil.js';
import { drawMapFrame } from './engine/map.js';
import { handleWorkerCallFactory } from './engine/worker-bridge.js';

import { Inventory } from './engine/inventory/Inventory.js';
import { CharacterManager } from './engine/characters/CharacterManager.js';
import { EntityManager } from './engine/entities/EntityManager.js';
import { CropManager } from './engine/crops/CropManager.js';
import { Crop } from './engine/crops/Crop.js';

import { GameState } from './engine/core/GameState.js';

import { initUnlockUI } from './engine/unlock/unlock-ui.js';
import { UnlockManager } from './engine/unlock/UnlockManager.js';
import { TECH_TREE } from './data/unlock.js';

import { SnakeGame } from './engine/snake/SnakeGame.js';

export function initGame() {
  const msg = document.getElementById('msg');
  const inv = document.getElementById('inventory');
  const consoleOut = document.getElementById('console-output');
  const techOverlay = document.getElementById('tech-overlay');
  const techToggleBtn = document.getElementById('toggle-tech');
  const techCloseBtn = document.getElementById('tech-close');
  const runBtn = document.getElementById('run');
  const timeoutInput = document.getElementById('timeout-ms');

  msg.textContent = '已就绪 ✅';

  // 编辑器
  const editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/javascript');

  // Pixi 初始化
  const canvasEl = document.getElementById('map');
  const viewW = canvasEl?.width || 400;
  const viewH = canvasEl?.height || 400;

  const app = new PIXI.Application({
    width: viewW,
    height: viewH,
    backgroundAlpha: 0,
    antialias: true
  });

  const cropTypes = {
    '土豆': { time: 3000, item: 'potato' },
    '花生': { time: 5000, item: 'peanut' },
    '南瓜': { time: 7000, item: 'pumpkin' },
    '稻草': { time: 0, item: 'straw' }
  };
  // ⭐ GameState（核心）
  app.gameState = new GameState({
    worldSize: 3,
    viewWidth: viewW
  });

  // 替换原 canvas
  app.view.id = 'map';
  if (canvasEl?.parentNode) {
    canvasEl.parentNode.replaceChild(app.view, canvasEl);
  }



  // ⭐ Inventory（背包）
  app.inventory = new Inventory({
    potato: 1000,
    peanut: 1000,
    pumpkin: 1000,
    straw: 1000
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

  // ⭐ UnlockManager（科技树）
  app.unlockManager = new UnlockManager({
    inventory: app.inventory,
    techLevels: {},
    unlocks: {},
    techTree: TECH_TREE
  });

  // 初始化科技 UI
  initUnlockUI(app, TECH_TREE);

  // 当前地图 crops 数据
  let crops = app.gameState.crops;

  // 初始化图层
  const layers = initLayers(app);
  app.layers = layers;

  // 土地层
  initSoilLayer({
    mapSize: app.gameState.world.size,
    tileSize: app.gameState.world.tileSize,
    url: 'asset/image/soil.png',
    soilLayer: layers.soilLayer
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

  function appendLog(args) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = args.map(a => String(a)).join(' ');
    consoleOut.appendChild(line);
    consoleOut.scrollTop = consoleOut.scrollHeight;
  }

  function updateInventory() {
    const t = app.inventory.getAll();
    inv.textContent =
      `🎒 背包: 土豆(${t.potato}) 花生(${t.peanut}) 南瓜(${t.pumpkin}) 稻草(${t.straw})`;
  }

  // =======================
  // 农场逻辑：move / plant / harvest / spawn / despawn
  // =======================
  function move(direction, id) {
    entityManager.move(direction, getWorldSize(), id);
  }

  function plant(type, id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    const key = `${e.x}_${e.y}`;
    if (crops[key]) return; // 已经有作物

    const crop = new Crop({
      type,
      plantedAt: Date.now(),
      matureTime: cropTypes[type]?.time || 0,
      key
    });

    crops[key] = crop;
  }

  function canHarvest(id) {
    const e = entityManager.getEntity(id);
    if (!e) return false;

    const crop = crops[`${e.x}_${e.y}`];
    if (!crop) return false;

    return (Date.now() - crop.plantedAt) >= crop.matureTime;
  }

  function harvest(id) {
    const e = entityManager.getEntity(id);
    if (!e) return;

    const key = `${e.x}_${e.y}`;
    const crop = crops[key];
    if (!crop) return;

    const elapsed = Date.now() - crop.plantedAt;
    if (elapsed < crop.matureTime) return;

    const itemKey = cropTypes[crop.type].item;

    // 🎯 科技加成
    const bonus = app.unlockManager.getLevel('pumpkin');
    const qty =
      itemKey === 'pumpkin'
        ? (1 + bonus)
        : 1;

    app.inventory.add(itemKey, qty);

    delete crops[key];
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

    gridLayer.clear();
    layers.soilLayer.removeChildren();
    layers.cropsLayer.removeChildren();
    layers.entitiesLayer.removeChildren();

    drawGrid();

    initSoilLayer({
      mapSize: size,
      tileSize: tile,
      url: 'asset/image/soil.png',
      soilLayer: layers.soilLayer
    });

    app.characterManager.clear();
    app.characterManager.update(entityManager.getAll(), size, tile);

    console.log('地图已重绘');
  }

  // =======================
  // 蛇模式
  // =======================
  function enterSnakeMode() {
    app.gameState.mode = 'snake';

    app.gameState.resetCrops();
    crops = app.gameState.crops;

    layers.cropsLayer.removeChildren();
    layers.entitiesLayer.removeChildren();

    const e0 = entityManager.getById(0) || entityManager.getActive();

    app.snakeGame = new SnakeGame(
      app,
      getTileSize(),
      getWorldSize(),
      { startX: e0.x, startY: e0.y }
    );
  }

  function exitSnakeMode(type = 'drone') {
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
    app.gameState.mode = 'farm';

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
      'drone': 'drone',
      '无人机': 'drone',
      'dino': 'dino',
      '恐龙': 'dino',
      'snake': 'snake'
    };

    const nextType = map[key];
    if (!nextType) return;

    if (nextType === 'snake') {
      enterSnakeMode();
      return;
    }
    if (app.gameState.mode === 'snake') {
      exitSnakeMode(nextType);
      return;
    }

    e.type = nextType;
  }

  // =======================
  // 重置
  // =======================
  function reset() {
    entityManager.reset();
    app.inventory.reset({
      potato: 1000,
      peanut: 1000,
      pumpkin: 1000,
      straw: 1000
    });

    app.gameState.resetCrops();
    crops = app.gameState.crops;

    msg.textContent = '已重置 ⟳';
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
    setWorldSize
  });

  // =======================
  // Worker 执行用户代码
  // =======================
  function setRunning(v) {
    isRunning = v;
    runBtn.textContent = v ? '中止' : '运行';
  }

  function abortRun() {
    try { worker?.terminate(); } catch { }
    worker = null;

    if (runTimeoutHandle) clearTimeout(runTimeoutHandle);

    setRunning(false);
    msg.textContent = '运行已中止 ⛔';
  }

  function runUserCode() {
    msg.textContent = '运行中…';
    setRunning(true);

    const code = editor.getValue();

    if (worker) worker.terminate();
    worker = new Worker('./js/runner.js');

    worker.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'call') {
        handleWorkerCall(data, worker);
      } else if (data.type === 'log') {
        appendLog(data.args || []);
      } else if (data.type === 'complete') {
        clearTimeout(runTimeoutHandle);
        setRunning(false);
        msg.textContent = '运行完成';
      } else if (data.type === 'error') {
        clearTimeout(runTimeoutHandle);
        setRunning(false);
        msg.textContent = '代码错误: ' + data.error;
      }
    };

    worker.postMessage({ type: 'run', code });

    if (runTimeoutMs > 0) {
      runTimeoutHandle = setTimeout(() => {
        abortRun();
        msg.textContent = '运行超时';
      }, runTimeoutMs);
    }
  }

  // =======================
  // 动画循环
  // =======================
  function animate() {
    if (app.gameState.mode === 'snake') {
      app.snakeGame.render();
      return;
    }

    app.cropManager.updateCrops(crops);

    drawMapFrame({
      app,
      mapSize: getWorldSize(),
      tileSize: getTileSize(),
      crops,
      entities: entityManager.getAll()
    });

    if (pendingFrameReqs.length && worker) {
      const reqs = pendingFrameReqs.splice(0);
      for (const id of reqs) {
        worker.postMessage({ type: 'response', reqId: id, result: true });
      }
    }
  }

  // =======================
  // 事件绑定
  // =======================
  runBtn.addEventListener('click', () => {
    if (isRunning) abortRun();
    else runUserCode();
  });

  document.getElementById('reset').addEventListener('click', reset);

  techToggleBtn.addEventListener('click', () => {
    techOverlay.style.display = 'block';
  });

  techCloseBtn.addEventListener('click', () => {
    techOverlay.style.display = 'none';
  });

  timeoutInput.value = String(runTimeoutMs);
  timeoutInput.addEventListener('change', () => {
    const v = parseInt(timeoutInput.value);
    if (v >= 0) {
      runTimeoutMs = v;
    }
  });

  updateInventory();
  app.ticker.add(animate);
}
