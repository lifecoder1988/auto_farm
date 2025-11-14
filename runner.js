// worker.js — 安全执行用户脚本（精简版，无帽子，无下划线函数）

// ===================== 内部状态 =====================

const pending = new Map();
let seq = 0;

let slowMode = true;
const chains = new Map();
const GLOBAL_CHAIN_KEY = "GLOBAL";

// 默认动作等待帧数
const actionWaitFrames = { move: 10, plant: 10, harvest: 10 };

// 实体执行作用域栈（支持 spawn 嵌套）
const scopeStack = [];

// ===================== 工具函数 =====================

function send(msg) {
  postMessage(msg);
}

// 和主线程通信（RPC）
function callMain(name, args = [], expectResponse = false) {
  const reqId = ++seq;
  const msg = { type: "call", name, args, reqId };

  if (!expectResponse) {
    send(msg);
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    pending.set(reqId, resolve);
    send(msg);
  });
}

// ===================== 慢速串行执行队列 =====================

function setSlowMode(v) {
  slowMode = !!v;
}

function withSlow(fn, frames = 1, key = GLOBAL_CHAIN_KEY) {
  if (!slowMode) return Promise.resolve(fn());

  const chainKey = key ?? GLOBAL_CHAIN_KEY;
  const current = chains.get(chainKey) || Promise.resolve();

  const next = current.then(async () => {
    const r = await fn();
    for (let i = 0; i < frames; i++) await waitFrame();
    return r;
  });

  chains.set(chainKey, next);
  return next;
}

// ===================== 用户 console 封装 =====================

const userConsole = {
  log: async (...args) => {
    try {
      const resolved = await Promise.all(
        args.map(async (a) => {
          try {
            if (a && typeof a.then === "function") return await a;
            return a;
          } catch (err) {
            return `Promise<error: ${err?.message || String(err)}>`;
          }
        })
      );
      send({ type: "log", args: resolved });
    } catch (_) {}
  },
};

// ===================== 基础 API：move / plant / harvest =====================

function _resolveEntityId(entityId) {
  // 顶层调用不再隐式绑定到最近的 spawn 实体，避免时序/作用域错乱。
  // 在 spawn 内部已通过 ctx 的 move/plant/harvest 等显式传入 id。
  if (entityId !== undefined) return entityId;
  return undefined;
}

async function move(direction, entityId) {
  const id = _resolveEntityId(entityId);
  const key = id !== undefined ? `E:${id}` : GLOBAL_CHAIN_KEY;
  return withSlow(
    () => callMain("move", [direction, id], true),
    actionWaitFrames.move,
    key
  );
}

async function plant(type, entityId) {
  const id = _resolveEntityId(entityId);
  const key = id !== undefined ? `E:${id}` : GLOBAL_CHAIN_KEY;
  return withSlow(
    () => callMain("plant", [type, id], true),
    actionWaitFrames.plant,
    key
  );
}

async function harvest(entityId) {
  const id = _resolveEntityId(entityId);
  const key = id !== undefined ? `E:${id}` : GLOBAL_CHAIN_KEY;
  return withSlow(
    () => callMain("harvest", [id], true),
    actionWaitFrames.harvest,
    key
  );
}

async function waitFrame() {
  await callMain("waitFrame", [], true);
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ===================== getEntity / getPlayer =====================

async function getPlayer() {
  return callMain("getPlayer", [], true);
}

async function getEntity(id) {
  const eid = _resolveEntityId(id);
  return callMain("getEntity", [eid], true);
}

async function getPosition(id) {
  const e = await getEntity(id);
  if (!e) return { id: undefined, x: undefined, y: undefined };
  return { id: e.id, x: e.x, y: e.y };
}

async function setActive(id) {
  return callMain("setActive", [id], false);
}

// ===================== doAFlip（保留但无下划线版本） =====================

async function doAFlip(entityId) {
  const id = _resolveEntityId(entityId);
  await callMain("doAFlip", [id], false);
  await delay(1000);
}

// ===================== changeCharacter（新增，支持蛇形别名） =====================

async function changeCharacter(characterType, entityId) {
  const id = _resolveEntityId(entityId);
  return callMain("changeCharacter", [characterType, id], true);
}

const change_character = async (characterType, entityId) => {
  const id = _resolveEntityId(entityId);
  return callMain("change_character", [characterType, id], true);
};

// ===================== spawn（核心，支持用户参数） =====================

async function spawn(fn, ...userArgs) {
  const id = await withSlow(() => callMain("spawn", [], true), 1);

  if (typeof fn === "function") {
    scopeStack.push(id);

    const ctx = {
      id,
      move: (d) => move(d, id),
      plant: (t) => plant(t, id),
      harvest: () => harvest(id),
      getEntity: () => callMain("getEntity", [id], true),
      delay,
    };

    try {
      // 将 ctx 作为首参，后续为用户自定义参数
      await fn(ctx, ...userArgs);
    } catch (err) {
      send({
        type: "error",
        error: err?.message || String(err),
      });
    } finally {
      scopeStack.pop();
      await callMain("despawn", [id], false);
    }
  }

  return id;
}

// ===================== 用户代码预处理 =====================

function strip(code) {
  return code
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, "")
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "")
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, "");
}

function transformSpawn(code) {
  let c = code;

  // 统一 async
  c = c.replace(/spawn\s*\(\s*function(\s+\w+)?\s*\(/g, (m, n) => `spawn(async function${n || ""}(`);
  c = c.replace(/spawn\s*\(\s*([^)]*?)=>\s*\{/g, "spawn(async $1=> {");

  // 无参函数注入 ctx
  c = c.replace(
    /spawn\s*\(\s*async\s*function(\s+\w+)?\s*\(\s*\)\s*\{/g,
    (m, n) => `spawn(async function${n || ""}({ move, plant, harvest, getEntity, delay, id }){`
  );
  c = c.replace(
    /spawn\s*\(\s*async\s*\(\s*\)\s*=>\s*\{/g,
    "spawn(async ({ move, plant, harvest, getEntity, delay, id }) => {"
  );

  // 普通 function/arrow 也支持
  c = c.replace(
    /spawn\s*\(\s*\(\s*\)\s*=>\s*\{/g,
    "spawn(async ({ move, plant, harvest, getEntity, delay, id }) => {"
  );
  c = c.replace(
    /spawn\s*\(\s*function(\s+\w+)?\s*\(\s*\)\s*\{/g,
    (m, n) => `spawn(async function${n || ""}({ move, plant, harvest, getEntity, delay, id }){`
  );

  return c;
}

function injectWaitIntoWhile(code) {
  return code.replace(/while\s*\([^)]*\)\s*\{/g, (m) => `${m}\n await waitFrame();\n`);
}


function autoAwaitAsyncApi(code) {
  // 需要自动 await 的 API
  const apis = [
    "move",
    "plant",
    "harvest",
    "delay",
    "waitFrame",
    "doAFlip",
    "changeCharacter",
    "change_character",
    "getEntity",
    "getPosition"
  ];

  for (const api of apis) {
    // 匹配 "api(" 但不包含 "await api("
    const reg = new RegExp(`(?<!await\\s+)(\\b${api}\\s*\\()`, "g");
    code = code.replace(reg, `await ${api}(`);
  }

  return code;
}

// ===================== 执行用户脚本 =====================


async function runUserCode(raw) {
  const stripped = strip(raw);
  const usesWhile = /(^|[^\w])while\s*\(/.test(stripped);

  let code = raw;

  if (slowMode) {
    code = transformSpawn(code);
    code = autoAwaitAsyncApi(code);
    if (usesWhile) code = injectWaitIntoWhile(code);
  }

  try {
    const fn = new Function(
      "console",
      "move",
      "plant",
      "harvest",
      "getPlayer",
      "spawn",
      "setActive",
      "getEntity",
      "getPosition",
      "doAFlip",
      "changeCharacter",
      "change_character",
      "delay",
      "waitFrame",
      "setSlowMode",
      `
        return (async () => {
          ${code}
        })();
      `
    );

    await fn(
      userConsole,
      move,
      plant,
      harvest,
      getPlayer,
      spawn,
      setActive,
      getEntity,
      getPosition,
      doAFlip,
      changeCharacter,
      change_character,
      delay,
      waitFrame,
      setSlowMode
    );

    send({ type: "complete" });
  } catch (err) {
    send({ type: "error", error: err?.message || String(err) });
  }
}

// ===================== Worker 收消息 =====================

onmessage = (e) => {
  const data = e.data;
  if (!data) return;

  if (data.type === "run") {
    runUserCode(data.code);
  } else if (data.type === "response") {
    const resolver = pending.get(data.reqId);
    if (resolver) {
      pending.delete(data.reqId);
      resolver(data.result);
    }
  }
};
