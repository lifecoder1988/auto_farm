// engine/worker-bridge.js

export function handleWorkerCallFactory(ctx) {
  const {
    move, plant, harvest, canHarvest, spawn, despawn, setActive,
    getEntity, getPlayer,
    pendingFrameReqs,
    getWorldSize,
    getTileSize,
    setWorldSize,
    changeCharacter,
    app,
    msg,
    createMaze,
    loadCodingFeatures
  } = ctx;

  return function handleWorkerCall(data, worker) {
    const { name, args, reqId } = data;

    function respond(result) {
      if (reqId != null && worker) {
        worker.postMessage({ type: 'response', reqId, result });
      }
    }

    // ==========================
    // ⭐ Snake 模式下特殊处理
    // ==========================
    if (app.gameState.mode === 'snake') {
      if (name === 'move') {
        app.snakeGame.step(args[0]);
        respond(true);
        return;
      }
      if(name === 'changeCharacter'){
        changeCharacter(args?.[0], args?.[1]);
        respond(true);
        return;
      }
      if(name === 'loadCodingFeatures'){
        const features = loadCodingFeatures();
        respond(features);
        return;
      }
      // 其它指令在 snake 模式下无效
      respond(null);
      return;
    }

    // ==========================
    // ⭐ 农场模式：主指令分发
    // ==========================
    switch (name) {

      case 'move': {
        move(args[0], args[1]);
        const e = getEntity(args?.[1]);
        respond({ id: e.id, x: e.x, y: e.y });
        return;
      }

      case 'plant': {
        plant(args[0], args[1]);
        respond(true);
        return;
      }

      case 'harvest': {
        harvest(args[0]);
        respond(true);
        return;
      }

      case 'canHarvest': {
        respond(!!canHarvest(args?.[0]));
        return;
      }

      case 'spawn': {
        const id = spawn();
        respond(id);
        return;
      }

      case 'despawn': {
        despawn(args?.[0]);
        respond(true);
        return;
      }

      case 'setActive': {
        setActive(args?.[0]);
        respond(true);
        return;
      }

      case 'getPlayer': {
        respond(getPlayer());
        return;
      }

      case 'getEntity': {
        respond(getEntity(args?.[0]));
        return;
      }

      // ==========================
      // ⭐ 帧等待：worker 等一帧
      // ==========================
      case 'waitFrame': {
        if (reqId != null) pendingFrameReqs.push(reqId);
        return;
      }
      case 'loadCodingFeatures': {
        const features = loadCodingFeatures();
        respond(features);
        return;
      }
      

      // ==========================
      // ⭐ 换帽子
      // ==========================
      case 'change_hat':
      case 'changeHat': {
        const hatKey = args?.[0];
        const id = args?.[1];
        const e = getEntity(id);
        if (e) e.hat = typeof hatKey === 'string' ? hatKey : 'Straw_Hat';
        respond(true);
        return;
      }

      // ==========================
      // ⭐ 换角色：drone/dino/snake
      // ==========================
      case 'change_character':
      case 'changeCharacter': {
        changeCharacter(args?.[0], args?.[1]);
        respond(true);
        return;
      }

      // ==========================
      // ⭐ do a flip
      // ==========================
      case 'doAFlip':
      case 'do_a_flip': {
        const e = getEntity(args?.[0]);
        if (e) e.flashUntil = Date.now() + 1000;
        respond(true);
        return;
      }

      // ==========================
      // ⭐ 科技：是否已解锁
      // ==========================
      case 'isUnlocked': {
        const key = args?.[0];
        respond(app.unlockManager.isUnlocked(key));
        return;
      }

      // ==========================
      // ⭐ 世界尺寸 / tileSize
      // ==========================
      case 'getWorldSize': {
        respond(getWorldSize());
        return;
      }

      case 'setWorldSize': {
        setWorldSize(args?.[0]);
        respond(true);
        return;
      }

      case 'getTileSize': {
        respond(getTileSize());
        return;
      }
      case 'createMaze': {
        const size = args && args[0];
        const entityId = args && args[1];   // 脚本上下文里的 entity id
        createMaze(size, entityId);
        respond(true);
        return;
      }

      default:
        respond(null);
    }
  };
}
