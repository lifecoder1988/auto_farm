// engine/worker-bridge.js

export function handleWorkerCallFactory(ctx) {
  const {
    move, plant, harvest, spawn, despawn, setActive,
    getEntity, getPlayer,
    pendingFrameReqs,
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
      default:
        respond(null);
    }
  };
}
