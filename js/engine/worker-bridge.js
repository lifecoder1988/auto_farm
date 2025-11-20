// engine/worker-bridge.js

export function handleWorkerCallFactory(ctx) {
  // ctx = app（Proxy）
  const api = ctx.api || {};              // move/plant/harvest 等 API
  const pendingFrameReqs = ctx.pendingFrameReqs;

  const getEntity = ctx.getEntity?.bind(ctx);
  const getPlayer = ctx.getPlayer?.bind(ctx);

  const getWorldSize = ctx.getWorldSize?.bind(ctx);
  const getTileSize = ctx.getTileSize?.bind(ctx);
  const setWorldSize = ctx.setWorldSize?.bind(ctx);
  const changeCharacter = ctx.changeCharacter?.bind(ctx);
  const createMaze = ctx.createMaze?.bind(ctx);
  const loadCodingFeatures = ctx.loadCodingFeatures?.bind(ctx);

  const till = ctx.till?.bind(ctx);
  const useWater = ctx.useWater?.bind(ctx);
  const useFertilizer = ctx.useFertilizer?.bind(ctx);
  const getGroundType = ctx.getGroundType?.bind(ctx);

  const app = ctx;        // 保留兼容
  const msg = ctx.msg;

  return function handleWorkerCall(data, worker) {
    const { name, args, reqId } = data;

    function respond(result) {
      if (reqId != null && worker) {
        worker.postMessage({ type: "response", reqId, result });
      }
    }

    // ====================================================
    // ⭐ Snake 模式（特殊处理）
    // ====================================================
    if (app.gameState.mode === "snake") {
      if (name === "move") {
        app.snakeGame.step(args[0]);
        respond(true);
        return;
      }

      if (name === "changeCharacter") {
        changeCharacter?.(args?.[0], args?.[1]);
        respond(true);
        return;
      }

      if (name === "loadCodingFeatures") {
        const features = loadCodingFeatures?.();
        respond(features);
        return;
      }

      respond(null);
      return;
    }

    // ====================================================
    // ⭐ 农场模式主指令：优先从 api 查找
    // ====================================================
    if (api[name]) {
      const result = api[name](...(args ?? []));
      respond(result);
      return;
    }

    // ====================================================
    // ⭐ 农场模式具体指令分发（保持你原有逻辑）
    // ====================================================
    switch (name) {
      case "move": {
        api.move?.(args[0], args[1]);
        const e = getEntity?.(args?.[1]);
        respond(e ? { id: e.id, x: e.x, y: e.y } : null);
        return;
      }

      case "plant":
      case "harvest":
      case "till":
      case "useWater":
      case "useFertilizer": {
        api[name]?.(args[0], args[1]);
        respond(true);
        return;
      }

      case "canHarvest": {
        const r = api.canHarvest?.(args?.[0]);
        respond(!!r);
        return;
      }

      case "spawn": {
        const id = api.spawn?.();
        respond(id);
        return;
      }

      case "despawn":
      case "setActive": {
        api[name]?.(args?.[0]);
        respond(true);
        return;
      }

      case "getPlayer": {
        respond(getPlayer?.());
        return;
      }

      case "getEntity": {
        respond(getEntity?.(args?.[0]));
        return;
      }

      // --------------------
      // ⭐ worker waitFrame
      // --------------------
      case "waitFrame": {
        if (reqId != null) pendingFrameReqs.push(reqId);
        return;
      }

      case "loadCodingFeatures": {
        const features = loadCodingFeatures?.();
        respond(features);
        return;
      }

      // --------------------
      // ⭐ 换帽子
      // --------------------
      case "change_hat":
      case "changeHat": {
        const [hatKey, id] = args || [];
        const e = getEntity?.(id);
        if (e) e.hat = typeof hatKey === "string" ? hatKey : "Straw_Hat";
        respond(true);
        return;
      }

      // --------------------
      // ⭐ 换角色 drone/dino/snake
      // --------------------
      case "changeCharacter": {
        changeCharacter?.(args?.[0], args?.[1]);
        respond(true);
        return;
      }

      // --------------------
      // ⭐ do a flip
      // --------------------
      case "doAFlip": {
        const e = getEntity?.(args?.[0]);
        if (e) e.flashUntil = Date.now() + 1000;
        respond(true);
        return;
      }

      // --------------------
      // ⭐ 科技解锁检测
      // --------------------
      case "isUnlocked": {
        const key = args?.[0];
        respond(app.unlockManager.isUnlocked(key));
        return;
      }

      // --------------------
      // ⭐ 世界尺寸 / tileSize
      // --------------------
      case "getWorldSize":
        respond(getWorldSize?.());
        return;

      case "setWorldSize":
        setWorldSize?.(args?.[0]);
        respond(true);
        return;

      case "getTileSize":
        respond(getTileSize?.());
        return;

      case "getGroundType":
        respond(getGroundType?.(args?.[0]));
        return;

      // --------------------
      // ⭐ 迷宫指令
      // --------------------
      case "createMaze": {
        createMaze?.(args?.[0], args?.[1]);
        respond(true);
        return;
      }

      default:
        respond(null);
    }
  };
}
