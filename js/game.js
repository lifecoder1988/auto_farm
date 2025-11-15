// game.js
import { initLayers, gridLayer } from './engine/layers.js';
import { initSoilLayer, resizeSoilLayer } from './engine/soil.js';
import { drawMapFrame } from './engine/map.js';
import { handleWorkerCallFactory } from './engine/worker-bridge.js';
import { cssHexToInt, hslToInt } from './utils/color.js';

import { CharacterManager } from './engine/characters/CharacterManager.js';

import { CropManager } from './engine/crops/CropManager.js';
import { Crop } from './engine/crops/Crop.js';


import { initUnlockUI, updateUnlock } from './unlock/unlock-ui.js';


import { SnakeGame } from './engine/snake/SnakeGame.js';
import { TECH_TREE } from './data/unlock.js';

export function initGame() {
  const msg = document.getElementById('msg');
  const inv = document.getElementById('inventory');
  const consoleOut = document.getElementById('console-output');
  const techOverlay = document.getElementById('tech-overlay');
  const techGraph = document.getElementById('tech-graph');
  const techToggleBtn = document.getElementById('toggle-tech');
  const techCloseBtn = document.getElementById('tech-close');
  const runBtn = document.getElementById('run');
  const timeoutInput = document.getElementById('timeout-ms');




  msg.textContent = '已就绪 ✅';



  // Ace 编辑器
  const editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/javascript');

  // Pixi 初始化
  const canvasEl = document.getElementById('map');
  const viewW = (canvasEl && canvasEl.width) ? canvasEl.width : 400;
  const viewH = (canvasEl && canvasEl.height) ? canvasEl.height : 400;

  const app = new PIXI.Application({
    width: viewW,
    height: viewH,
    backgroundColor: 0x333333,
    backgroundAlpha: 0,
    antialias: true
  });

  const characterManager = new CharacterManager();
  app.characterManager = characterManager;

  // Pixi 初始化后
  app.cropManager = new CropManager();


  initUnlockUI(app, TECH_TREE);


  app.view.id = 'map';
  if (canvasEl && canvasEl.parentNode) {
    canvasEl.parentNode.replaceChild(app.view, canvasEl);
  }



  // 全局 state
  app.state = app.state || {};
  app.state.items = app.state.items || { potato: 1000, peanut: 1000, pumpkin: 1000, straw: 1000 };
  app.state.techLevels = app.state.techLevels || {};
  app.state.crops = app.state.crops || {};
  app.state.unlocks = app.state.unlocks || {};

  app.state.worldSize = app.state.worldSize || 3;
  app.state.tileSize = Math.floor(app.view.width / app.state.worldSize);



  let crops = app.state.crops;
  let entities = [
    { id: 0, x: 0, y: 0, Items: { potato: 0, peanut: 0, pumpkin: 0, straw: 0 }, type: 'drone', hat: 'Straw_Hat' }
  ];
  let activeEntityId = 0;

  // 图层
  const layers = initLayers(app); // 包含 soilLayer, gridLayer, cropsLayer, entitiesLayer

  app.layers = layers
  // soilLayer 初始化（方案 B）
  const SOIL_URL = 'asset/image/soil.png';
  initSoilLayer({
    mapSize: app.state.worldSize,
    tileSize: app.state.tileSize,
    url: SOIL_URL,
    soilLayer: layers.soilLayer
  });

  // 网格静态绘制
  gridLayer.clear();
  gridLayer.lineStyle(1, 0x555555, 1);
  for (let y = 0; y < app.state.worldSize; y++) {
    for (let x = 0; x < app.state.worldSize; x++) {
      gridLayer.drawRect(x * app.state.tileSize, y * app.state.tileSize, app.state.tileSize, app.state.tileSize);
    }
  }

  // Worker 相关
  let worker = null;
  let runTimeoutHandle = null;
  let runTimeoutMs = 600000;
  const pendingFrameReqs = [];
  let isRunning = false;

  const cropTypes = {
    '土豆': { time: 3000, item: 'potato' },
    '花生': { time: 5000, item: 'peanut' },
    '南瓜': { time: 7000, item: 'pumpkin' },
    '稻草': { time: 0, item: 'straw' }
  };


  function getWorldSize() {
    return app.state.worldSize;
  }

  function getTileSize() {
    return app.state.tileSize;
  }

  function setWorldSize(size) {
    app.state.worldSize = Number(size);
    app.state.tileSize = Math.floor(app.view.width / app.state.worldSize);
    rebuildWorld();
  }


  function formatArg(a) {
    if (typeof a === 'string') return a;
    try { return JSON.stringify(a); } catch (_) { return String(a); }
  }
  function appendLog(args) {
    if (!consoleOut) return;
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = (args || []).map(formatArg).join(' ');
    consoleOut.appendChild(line);
    consoleOut.scrollTop = consoleOut.scrollHeight;
  }

  function getEntity(id = activeEntityId) {
    return entities.find(e => e.id === id) || entities[0];
  }

  function getTotalItems() {
    if (app && app.state && app.state.items) {
      return { ...app.state.items };
    }
    const totals = { potato: 0, peanut: 0, pumpkin: 0, straw: 0 };
    for (const e of entities) {
      totals.potato += (e.Items.potato || 0);
      totals.peanut += (e.Items.peanut || 0);
      totals.pumpkin += (e.Items.pumpkin || 0);
      totals.straw += (e.Items.straw || 0);
    }
    return totals;
  }

  function updateInventory() {
    const totals = getTotalItems();
    inv.textContent = `🎒 全局背包: 土豆(${totals.potato}) 花生(${totals.peanut}) 南瓜(${totals.pumpkin}) 稻草(${totals.straw || 0})`;
    // 这里原来还会更新科技树 UI：updateTechTree()
  }

  // move / plant / harvest / spawn / despawn 保留在 game.js 里
  function move(direction, id) {
    const e = getEntity(id);
    switch (direction) {
      case 'up': e.y++; break;
      case 'down': e.y--; break;
      case 'left': e.x--; break;
      case 'right': e.x++; break;
      default: throw new Error('未知方向: ' + direction);
    }
    const wrap = (v) => ((v % app.state.worldSize) + app.state.worldSize) % app.state.worldSize;
    e.x = wrap(e.x);
    e.y = wrap(e.y);
  }

  function plant(type, id) {
    const e = getEntity(id);
    if (!cropTypes[type]) { return; }
    const key = `${e.x}_${e.y}`;
    if (crops[key]) { return; }

    const crop = new Crop({
      type,

      plantedAt: Date.now(),
      matureTime: cropTypes[type].time,
      key: key,
    });
    crops[key] = crop;

  }

  // 检查当前位置是否有作物且已成熟
  function canHarvest(id) {
    const e = getEntity(id);
    const key = `${e.x}_${e.y}`;
    const crop = crops[key];
    if (!crop) { return false; }

    const elapsed = Date.now() - crop.plantedAt;
    return elapsed >= (crop.matureTime || 0);
  }

  function harvest(id) {
    const e = getEntity(id);
    const key = `${e.x}_${e.y}`;
    const crop = crops[key];
    if (!crop) { return; }
    const elapsed = Date.now() - crop.plantedAt;
    if (elapsed < crop.matureTime) { return; }
    const itemKey = cropTypes[crop.type].item;
    const levels = (app && app.state && app.state.techLevels) ? app.state.techLevels : {};
    const pumpkinLvl = Number(levels['pumpkin'] || 0);
    const yieldQty = (itemKey === 'pumpkin') ? (1 + pumpkinLvl) : 1;
    e.Items[itemKey] = (e.Items[itemKey] || 0) + yieldQty;
    if (app && app.state && app.state.items && itemKey in app.state.items) {
      app.state.items[itemKey] = (app.state.items[itemKey] || 0) + yieldQty;
    }
    delete crops[key];

    updateInventory();
  }

  function spawn() {
    const newId = entities.length ? Math.max(...entities.map(x => x.id)) + 1 : 0;
    const ref = getEntity(activeEntityId);
    entities.push({ id: newId, x: ref.x, y: ref.y, type: ref.type, Items: { potato: 0, peanut: 0, pumpkin: 0, straw: 0 }, hat: 'Straw_Hat' });

    return newId;
  }

  function setActive(id) {
    const found = entities.find(e => e.id === id);
    if (found) {
      activeEntityId = id;

      updateInventory();
    } else {

    }
  }



  function rebuildWorld() {
    const worldSize = getWorldSize();
    const tileSize = getTileSize();

    // 1. 清理旧图层
    gridLayer.clear();
    app.layers.soilLayer.removeChildren();
    app.layers.cropsLayer.removeChildren();
    app.layers.entitiesLayer.removeChildren();

    // 2. 重绘网格
    gridLayer.lineStyle(1, 0x555555, 1);
    for (let y = 0; y < worldSize; y++) {
      for (let x = 0; x < worldSize; x++) {
        gridLayer.drawRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // 3. 重绘土地（soilLayer）
    initSoilLayer({
      mapSize: worldSize,
      tileSize,
      url: 'asset/image/soil.png',
      soilLayer: app.layers.soilLayer,
    });

    // 4. 农场模式下更新 crops 与实体渲染
    app.cropManager.cropSprites.clear();

    app.characterManager.clear();

    app.characterManager.update(
      entities,
      worldSize,
      tileSize
    );


    console.log("地图已重绘，worldSize =", worldSize);
  }


  function exitSnakeMode(app, type) {
    const head = app.snakeGame.model.body[0];

    const e0 = entities.find(e => e.id === 0);
    if (e0) {
      e0.x = head.x;
      e0.y = head.y;
      e0.type = type; // 或 dino，随你
    }

    if (app.snakeGame && app.snakeGame.renderer) {
      app.snakeGame.renderer.destroy();  // ⭐ 必须销毁
    }

    // 恢复农场模式
    app.mode = 'farm';
    app.snakeGame = null;

    // 让农场重新渲染
    app.layers.cropsLayer.removeChildren();
    app.layers.entitiesLayer.removeChildren();

    console.log("退出蛇模式: 回写 entity0 =", head.x, head.y);
  }

  function enterSnakeMode(app) {
    app.mode = 'snake';

    // 1) 清空农场 crop / entity 渲染
    app.state.crops = {};
    crops = app.state.crops;
    app.layers.cropsLayer.removeChildren();
    app.layers.entitiesLayer.removeChildren();

    // 2) 取 entity0 的位置 → 作为蛇头初始位置
    const e0 = entities.find(e => e.id === 0);
    const startX = e0?.x ?? 0;
    const startY = e0?.y ?? 0;

    // 3) 创建 snakeGame，传入初始坐标
    app.snakeGame = new SnakeGame(app, app.state.tileSize, app.state.worldSize, {
      startX,
      startY
    });

    console.log("进入蛇模式: 蛇头初始坐标 =", startX, startY);
  }


  // 切换角色类型（例如 'drone' 或 'dino'）
  function changeCharacter(typeKey, id) {
    const e = getEntity(id);
    const key = String(typeKey || '').trim().toLowerCase();
    const map = {
      'drone': 'drone',
      '无人机': 'drone',
      'dino': 'dino',
      'snake': 'snake',
      'dinosaur': 'dino'
    };

    const nextType = map[key];
    if (!nextType) {
      //if (msg) msg.textContent = '未知角色类型: ' + typeKey;
      return;
    }

    if (e.type === nextType) {
      //if (msg) msg.textContent = '角色已是 ' + nextType;
      return;
    }


    // 切换到蛇模式
    if (nextType === 'snake') {
      enterSnakeMode(app);
      return; // 不继续执行农场逻辑
    }

    // 离开蛇模式 → 进入农场模式
    if (app.mode === 'snake' && nextType !== 'snake') {
      exitSnakeMode(app);
    }

    e.type = nextType;



    //if (msg) msg.textContent = `角色已切换为 ${nextType === 'drone' ? '无人机' : '恐龙'} ✅`;
  }

  function despawn(id) {
    const idx = entities.findIndex(e => e.id === id);
    if (idx >= 0) {
      const removed = entities[idx];
      entities.splice(idx, 1);
      if (entities.length === 0) {
        entities = [
          { id: 0, x: 0, y: 0, Items: { potato: 0, peanut: 0, pumpkin: 0, straw: 0 }, type: 'drone', hat: 'Straw_Hat' }
        ];
      }
      if (activeEntityId === removed.id) {
        activeEntityId = entities[0].id;
      }

      updateInventory();
    }
  }

  function reset() {
    entities = [
      { id: 0, x: 0, y: 0, Items: { potato: 0, peanut: 0, pumpkin: 0, straw: 0 }, type: 'drone', hat: 'Straw_Hat' }
    ];
    activeEntityId = 0;
    if (app && app.state) {
      app.state.crops = {};
      app.state.unlocks = {};
      app.state.techLevels = {};
      crops = app.state.crops;
      app.state.items = { potato: 1000, peanut: 1000, pumpkin: 1000, straw: 1000 };
    }
    msg.textContent = '已重置 ⟳';
    updateInventory();
  }

  // Worker call handler（抽成一个工厂函数）
  const handleWorkerCall = handleWorkerCallFactory({
    move, plant, harvest, canHarvest, spawn, despawn, setActive,
    getEntity: (id) => ({ ...getEntity(id) }),
    getPlayer: () => ({ ...getEntity(activeEntityId) }),
    pendingFrameReqs,
    app,
    msg,
    changeCharacter,
    getWorldSize,
    getTileSize,
    setWorldSize
  });

  function setRunning(v) {
    isRunning = v;
    if (runBtn) runBtn.textContent = v ? '中止' : '运行';
  }

  function abortRun() {
    try { if (worker) { worker.terminate(); } } catch (_) { }
    worker = null;
    if (runTimeoutHandle) {
      try { clearTimeout(runTimeoutHandle); } catch (_) { }
      runTimeoutHandle = null;
    }
    setRunning(false);
    msg.textContent = '运行已中止 ⛔';
  }

  function runUserCode() {
    msg.textContent = '运行中…';
    setRunning(true);
    const code = editor.getValue();
    if (worker) { try { worker.terminate(); } catch (_) { worker = null; } }
    worker = new Worker('./js/runner.js');
    worker.onmessage = (e) => {
      const data = e.data;
      if (!data) return;
      if (data.type === 'call') {
        handleWorkerCall(data, worker);
      } else if (data.type === 'log') {
        appendLog(data.args);
      } else if (data.type === 'complete') {
        clearTimeout(runTimeoutHandle);
        setRunning(false);
        msg.textContent = '运行完成 ✅';
      } else if (data.type === 'error') {
        clearTimeout(runTimeoutHandle);
        setRunning(false);
        msg.textContent = '代码错误 ❌ ' + data.error;
      }
    };
    worker.postMessage({ type: 'run', code });

    clearTimeout(runTimeoutHandle);
    if (runTimeoutMs > 0) {
      runTimeoutHandle = setTimeout(() => {
        if (worker) {
          try { worker.terminate(); } catch (_) { }
          worker = null;
          setRunning(false);
          msg.textContent = '运行超时 ⏱ 已安全终止';
        }
      }, runTimeoutMs);
    }
  }

  function animate() {


    if (app.mode === 'snake') {
      app.snakeGame.render();   // 用 PIXI ticker 的 deltaMS
      return;
    }

    app.cropManager.updateCrops(crops);

    drawMapFrame({
      app,
      mapSize: app.state.worldSize,
      tileSize: app.state.tileSize,
      crops,
      entities
    });

    // 处理 waitFrame
    if (pendingFrameReqs.length && worker) {
      const reqs = pendingFrameReqs.splice(0, pendingFrameReqs.length);
      for (const reqId of reqs) {
        try { worker.postMessage({ type: 'response', reqId, result: true }); } catch (_) { }
      }
    }
  }

  function onRunButtonClick() {
    if (isRunning) abortRun();
    else runUserCode();
  }

  // 事件绑定
  runBtn && runBtn.addEventListener('click', onRunButtonClick);
  document.getElementById('reset').addEventListener('click', reset);
  if (techToggleBtn) techToggleBtn.addEventListener('click', () => { techOverlay.style.display = 'block'; /* updateTechTree()*/ });
  if (techCloseBtn) techCloseBtn.addEventListener('click', () => { techOverlay.style.display = 'none'; });

  if (timeoutInput) {
    timeoutInput.value = String(runTimeoutMs);
    timeoutInput.addEventListener('change', () => {
      const v = parseInt(timeoutInput.value, 10);
      if (Number.isFinite(v) && v >= 0) {
        runTimeoutMs = v;
        msg.textContent = v === 0 ? '超时已关闭 ⏳' : `运行超时设为 ${v}ms`;
      } else {
        timeoutInput.value = String(runTimeoutMs);
      }
    });
  }

  updateInventory();
  app.ticker.add(animate);

  // 如果未来有窗口 resize，这里可以调用 resizeSoilLayer(tileSize) 等
}
