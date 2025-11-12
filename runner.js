// Web Worker: 安全运行用户脚本，避免阻塞主线程

const pending = new Map();
let seq = 0;
// 移除作用域栈的全局影响，改为在 spawn 回调内通过参数覆盖 move/plant/harvest
const userConsole = {
  // 支持传入 Promise 参数：会在打印前自动等待并解包
  log: async (...args) => {
    try {
      const resolved = await Promise.all(args.map(async (a) => {
        try {
          if (a && typeof a.then === 'function') return await a;
          return a;
        } catch (err) {
          return `Promise<error: ${err && err.message ? err.message : String(err)}>`;
        }
      }));
      postMessage({ type: 'log', args: resolved });
    } catch (_) {}
  }
};

function callMain(name, args = [], expectResponse = false) {
  const reqId = ++seq;
  const msg = { type: 'call', name, args, reqId };
  if (expectResponse) {
    return new Promise((resolve) => {
      pending.set(reqId, resolve);
      postMessage(msg);
    });
  } else {
    postMessage(msg);
    return Promise.resolve(null);
  }
}

// 提供给用户代码的 API（在 Worker 内部实现为消息调用到主线程）
let slowMode = true;
function setSlowMode(v){ slowMode = !!v; }
// 慢速串行队列：保证开启慢速时，动作按帧逐个执行
// 将慢速串行队列改为“按实体分链”，不同实体并行、同一实体内串行
const chains = new Map();
const GLOBAL_CHAIN_KEY = 'GLOBAL';
// 每个动作的内置帧等待时长（可根据需要调整）
const actionWaitFrames = { move: 10, plant: 10, harvest: 10 };
function withSlow(fn, frames = 1, key = GLOBAL_CHAIN_KEY){
  if (!slowMode) return fn();
  const chainKey = key ?? GLOBAL_CHAIN_KEY;
  const current = chains.get(chainKey) || Promise.resolve();
  const n = Number.isFinite(frames) && frames > 0 ? Math.floor(frames) : 1;
  const next = current.then(async () => {
    const r = await fn();
    for (let i = 0; i < n; i++) { await waitFrame(); }
    return r;
  });
  chains.set(chainKey, next);
  return next;
}
async function move(direction, entityId) {
  const effectiveId = (entityId !== undefined) ? entityId : undefined;
  const key = (effectiveId !== undefined) ? `E:${effectiveId}` : GLOBAL_CHAIN_KEY;
  return withSlow(() => callMain('move', [direction, effectiveId], true), actionWaitFrames.move, key);
}
async function plant(type, entityId) {
  const effectiveId = (entityId !== undefined) ? entityId : undefined;
  const key = (effectiveId !== undefined) ? `E:${effectiveId}` : GLOBAL_CHAIN_KEY;
  return withSlow(() => callMain('plant', [type, effectiveId], true), actionWaitFrames.plant, key);
}
async function harvest(entityId) {
  const effectiveId = (entityId !== undefined) ? entityId : undefined;
  const key = (effectiveId !== undefined) ? `E:${effectiveId}` : GLOBAL_CHAIN_KEY;
  return withSlow(() => callMain('harvest', [effectiveId], true), actionWaitFrames.harvest, key);
}
async function spawn(fn) {
  // 创建实体并返回 id；若传入函数，则在该实体作用域中执行，结束后自动消失
  // 将创建步骤纳入全局慢速队列，确保与顶层 move 等动作的顺序一致
  const id = await withSlow(() => callMain('spawn', [], true), 1, GLOBAL_CHAIN_KEY);
  if (typeof fn === 'function') {
    // 复用全局 move/plant/harvest，以应用慢速模式逻辑
    const sMove = (direction) => move(direction, id);
    const sPlant = (type) => plant(type, id);
    const sHarvest = () => harvest(id);
    const sGetEntity = () => callMain('getEntity', [id], true);
    try {
      // 在回调参数中提供绑定到该实体的 API，避免全局污染
      await fn({ id, move: sMove, plant: sPlant, harvest: sHarvest, getEntity: sGetEntity, delay });
    } catch (err) {
      // 将错误回传用于 UI 提示，但仍确保实体被清理
      postMessage({ type: 'error', error: err && err.message ? err.message : String(err) });
    } finally {
      await callMain('despawn', [id], false);
    }
  }
  return id;
}
async function setActive(id) { return callMain('setActive', [id], false); }
async function getPlayer() { return callMain('getPlayer', [], true); }
async function getEntity(id) {
  const effectiveId = (id !== undefined) ? id : undefined;
  return callMain('getEntity', [effectiveId], true);
}
async function getPosition(id) {
  const e = await getEntity(id);
  return e ? { id: e.id, x: e.x, y: e.y } : { id: undefined, x: undefined, y: undefined };
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
// 等待下一渲染帧（由主线程在下一帧响应）
async function waitFrame() { await callMain('waitFrame', [], true); }

// doAFlip：触发主线程闪烁效果，并等待 1 秒（别名：do_a_flip）
async function doAFlip(entityId) {
  const effectiveId = (entityId !== undefined) ? entityId : (scopeStack.length ? scopeStack[scopeStack.length - 1] : undefined);
  await callMain('doAFlip', [effectiveId], false);
  await delay(1000);
}
const do_a_flip = (...args) => doAFlip(...args);

// Hats 枚举：提供所有帽子键（与主线程 HatColors 键一致）
const Hats = {
  Straw_Hat: 'Straw_Hat',
  Brown_Hat: 'Brown_Hat',
  Cactus_Hat: 'Cactus_Hat',
  Carrot_Hat: 'Carrot_Hat',
  Dinosaur_Hat: 'Dinosaur_Hat',
  Gold_Hat: 'Gold_Hat',
  Gold_Trophy_Hat: 'Gold_Trophy_Hat',
  Golden_Cactus_Hat: 'Golden_Cactus_Hat',
  Golden_Carrot_Hat: 'Golden_Carrot_Hat',
  Golden_Gold_Hat: 'Golden_Gold_Hat',
  Golden_Pumpkin_Hat: 'Golden_Pumpkin_Hat',
  Golden_Sunflower_Hat: 'Golden_Sunflower_Hat',
  Golden_Tree_Hat: 'Golden_Tree_Hat',
  Gray_Hat: 'Gray_Hat',
  Green_Hat: 'Green_Hat',
  Pumpkin_Hat: 'Pumpkin_Hat',
  Purple_Hat: 'Purple_Hat',
  Silver_Trophy_Hat: 'Silver_Trophy_Hat',
  Sunflower_Hat: 'Sunflower_Hat',
  The_Farmers_Remains: 'The_Farmers_Remains',
  Top_Hat: 'Top_Hat',
  Traffic_Cone: 'Traffic_Cone',
  Traffic_Cone_Stack: 'Traffic_Cone_Stack',
  Tree_Hat: 'Tree_Hat',
  Wizard_Hat: 'Wizard_Hat',
  Wood_Trophy_Hat: 'Wood_Trophy_Hat'
};

// changeHat：更换帽子（别名：change_hat）
async function changeHat(hat, entityId) {
  const effectiveId = (entityId !== undefined) ? entityId : (scopeStack.length ? scopeStack[scopeStack.length - 1] : undefined);
  return callMain('changeHat', [hat, effectiveId], true);
}
const change_hat = async (hat, entityId) => callMain('change_hat', [hat, (entityId !== undefined) ? entityId : (scopeStack.length ? scopeStack[scopeStack.length - 1] : undefined)], true);

onmessage = async (e) => {
  const data = e.data;
  if (!data) return;
  if (data.type === 'run') {
    const code = data.code || '';
    try {
      const stripped = code
        .replace(/\/\/[^\n]*?/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, '')
        .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '')
        .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '');
      const usesWhile = /(^|[^\w])while\s*\(/.test(stripped);
      let toRun = code;
      if (slowMode) {
        try {
          // 1) 将 spawn 的回调统一提升为 async（支持具名/匿名 function 与箭头函数）
          toRun = toRun.replace(/spawn\s*\(\s*function(\s+\w+)?\s*\(/g, (m, name) => `spawn(async function${name || ''}(`);
          toRun = toRun.replace(/spawn\s*\(\s*([^)]*?)=>\s*\{/g, 'spawn(async $1=> {');
          // 2) 对无参回调注入参数解构，覆盖 move/plant/harvest，使其指向实体绑定的 API
          toRun = toRun.replace(/spawn\s*\(\s*async\s*function(\s+\w+)?\s*\(\s*\)\s*\{/g, (m, name) => `spawn(async function${name || ''}({ move, plant, harvest, getEntity, delay, id }){`);
          toRun = toRun.replace(/spawn\s*\(\s*async\s*\(\s*\)\s*=>\s*\{/g, 'spawn(async ({ move, plant, harvest, getEntity, delay, id }) => {');
          // 兼容未显式 async 的无参箭头/函数
          toRun = toRun.replace(/spawn\s*\(\s*\(\s*\)\s*=>\s*\{/g, 'spawn(async ({ move, plant, harvest, getEntity, delay, id }) => {');
          toRun = toRun.replace(/spawn\s*\(\s*function(\s+\w+)?\s*\(\s*\)\s*\{/g, (m, name) => `spawn(async function${name || ''}({ move, plant, harvest, getEntity, delay, id }){`);
        } catch (_) {}
        if (usesWhile) {
          try { toRun = toRun.replace(/while\s*\([^)]*\)\s*\{/g, (m) => m + "\n await waitFrame();\n"); } catch (_) {}
        }
      }
      /*if (usesWhile) {
        const allowed = await callMain('isUnlocked', ['while'], true);
        if (!allowed) {
          postMessage({ type: 'error', error: 'while 指令未解锁，请先在科技树中解锁。' });
          return;
        }
      }*/
      // 自动包装为顶层 async，便于用户使用 await delay()
      const fn = new Function(
        'console','move','plant','harvest','getPlayer','spawn','setActive','getEntity','getPosition','doAFlip','do_a_flip','delay','waitFrame','Hats','changeHat','change_hat','setSlowMode',
        "return (async () => {\n" + toRun + "\n})()"
      );
      await fn(userConsole, move, plant, harvest, getPlayer, spawn, setActive, getEntity, getPosition, doAFlip, do_a_flip, delay, waitFrame, Hats, changeHat, change_hat, setSlowMode);
      postMessage({ type: 'complete' });
    } catch (err) {
      postMessage({ type: 'error', error: err && err.message ? err.message : String(err) });
    }
  } else if (data.type === 'response') {
    const { reqId, result } = data;
    const resolver = pending.get(reqId);
    if (resolver) {
      pending.delete(reqId);
      resolver(result);
    }
  }
};