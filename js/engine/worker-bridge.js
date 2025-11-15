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
    msg
  } = ctx;

  return function handleWorkerCall(data, worker) {
    const { name, args, reqId } = data;

    function respond(result) {
      if (reqId != null && worker) {
        worker.postMessage({ type: 'response', reqId, result });
      }
    }

    if (app.mode === 'snake') {
      if (name === 'move') {
        app.snakeGame.step(args[0]);
        respond(true);
        return;
      }
      respond(null);
    }

    switch (name) {
      case 'move': {
        move(args[0], args[1]);
        const e = getEntity(args && args[1] != null ? args[1] : undefined);
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
        const id = args && args[0];
        const r = canHarvest(id);
        respond(!!r);
        return;
      }
      case 'spawn': {
        const id = spawn();
        respond(id);
        return;
      }
      case 'despawn': {
        despawn(args[0]);
        respond(true);
        return;
      }
      case 'setActive': {
        setActive(args[0]);
        respond(true);
        return;
      }
      case 'getPlayer': {
        respond(getPlayer());
        return;
      }
      case 'getEntity': {
        const e = getEntity(args && args[0]);
        respond(e);
        return;
      }
      case 'waitFrame': {
        if (reqId != null) pendingFrameReqs.push(reqId);
        return;
      }
      case 'change_hat':
      case 'changeHat': {
        const hatKey = args && args[0];
        const id = args && args[1];
        const e = getEntity(id);
        e.hat = typeof hatKey === 'string' ? hatKey : 'Straw_Hat';
        respond(true);
        return;
      }
      case 'change_character':
      case 'changeCharacter': {
        const typeKey = args && args[0];
        const id = args && args[1];

        changeCharacter(typeKey, id);

        respond(true);
        return;
      }

      case 'doAFlip':
      case 'do_a_flip': {
        const id = args && args[0];
        const e = getEntity(id);
        e.flashUntil = Date.now() + 1000;
        respond(true);
        return;
      }
      case 'isUnlocked': {
        const key = args && args[0];
        const unlocked = (app && app.state && app.state.unlocks) ? app.state.unlocks : {};
        respond(!!unlocked[key]);
        return;
      }

      case 'getWorldSize': {
        respond(getWorldSize());
        return;
      }

      case 'setWorldSize': {
        const newSize = args && args[0];
        setWorldSize(newSize);
        respond(true);
        return;
      }

      case 'getTileSize': {
        respond(getTileSize());
        return;
      }
      default:
        respond(null);
    }
  };
}
