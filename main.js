function onAceReady(cb){
  if (window.ace) return cb();
  const s = document.getElementById('ace-loader');
  if (s) s.addEventListener('load', () => cb());
  const t = setInterval(()=>{ if (window.ace){ clearInterval(t); cb(); } }, 50);
}

onAceReady(init);

function init(){
  const msg = document.getElementById('msg');
  const inv = document.getElementById('inventory');
  msg.textContent = '已就绪 ✅';

  const editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/javascript');

  const canvas = document.getElementById('map');
  const ctx = canvas.getContext('2d');
  const mapSize = 10;
  const tileSize = canvas.width / mapSize;
  const consoleOut = document.getElementById('console-output');
  const techOverlay = document.getElementById('tech-overlay');
  const techGrid = document.getElementById('tech-grid');
  const techToggleBtn = document.getElementById('toggle-tech');
  const techCloseBtn = document.getElementById('tech-close');
  const runBtn = document.getElementById('run');

  // 多实体支持：entities[ {id,x,y,Items,hat} ]
  let entities = [ { id: 0, x: 0, y: 0, Items: { potato:0, peanut:0, pumpkin:0, straw:0 }, hat: 'Straw_Hat' } ];
  let activeEntityId = 0;
  let crops = {}; // {"x_y": {type, plantedAt, matureTime}}
  let worker = null;
  let runTimeoutHandle = null;
  let runTimeoutMs = 600000;
  // 等待下一帧的请求队列（由 Worker 发起，下一次动画帧时回应）
  const pendingFrameReqs = [];
  let isRunning = false;

  function setRunning(v){
    isRunning = v;
    if (runBtn) runBtn.textContent = v ? '中止' : '运行';
  }

  function abortRun(){
    try { if (worker) { worker.terminate(); } } catch(_){}
    worker = null;
    if (runTimeoutHandle) { try { clearTimeout(runTimeoutHandle); } catch(_){} runTimeoutHandle = null; }
    setRunning(false);
    msg.textContent = '运行已中止 ⛔';
  }

  const cropTypes = {
    '土豆': {time:3000, item:'potato'},
    '花生': {time:5000, item:'peanut'},
    '南瓜': {time:7000, item:'pumpkin'},
    '稻草': {time:0, item:'straw'}
  };

  // 帽子颜色映射：不同帽子改变小人颜色
  const HatColors = {
    'Straw_Hat': '#c8a85f',
    'Brown_Hat': '#795548',
    'Gray_Hat': '#9e9e9e',
    'Green_Hat': '#4caf50',
    'Purple_Hat': '#9c27b0',
    'Top_Hat': '#212121',
    'Wizard_Hat': '#3949ab',
    'Traffic_Cone': '#fb8c00',
    'Traffic_Cone_Stack': '#ef6c00',
    'Pumpkin_Hat': '#ff9800',
    'Carrot_Hat': '#ff5722',
    'Tree_Hat': '#2e7d32',
    'Sunflower_Hat': '#fdd835',
    'Cactus_Hat': '#43a047',
    'Dinosaur_Hat': '#26a69a',
    'Gold_Hat': '#ffd54f',
    'Gold_Trophy_Hat': '#ffca28',
    'Golden_Cactus_Hat': '#c0ca33',
    'Golden_Carrot_Hat': '#fbc02d',
    'Golden_Gold_Hat': '#ffb300',
    'Golden_Pumpkin_Hat': '#f9a825',
    'Golden_Sunflower_Hat': '#fdd835',
    'Golden_Tree_Hat': '#c0ca33',
    'Silver_Trophy_Hat': '#c0c0c0',
    'Wood_Trophy_Hat': '#8d6e63',
    'The_Farmers_Remains': '#6d4c41'
  };

  function formatArg(a){
    if (typeof a === 'string') return a;
    try { return JSON.stringify(a); } catch (_) { return String(a); }
  }
  function appendLog(args){
    if (!consoleOut) return;
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = (args || []).map(formatArg).join(' ');
    consoleOut.appendChild(line);
    consoleOut.scrollTop = consoleOut.scrollHeight;
  }

  function getEntity(id = activeEntityId){
    return entities.find(e => e.id === id) || entities[0];
  }

  function updateInventory(){
    const totals = getTotalItems();
    inv.textContent = `🎒 全局背包: 土豆(${totals.potato}) 花生(${totals.peanut}) 南瓜(${totals.pumpkin}) 稻草(${totals.straw||0})`;
    updateTechTree();
  }

  function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        ctx.strokeStyle = '#555';
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        const ly = mapSize - 1 - y; // 逻辑坐标的 y（左下为原点）
        const key = `${x}_${ly}`;
        if (crops[key]) {
          const crop = crops[key];
          const elapsed = Date.now() - crop.plantedAt;
          const progress = Math.min(elapsed / crop.matureTime, 1);
          const color = `hsl(${progress * 60}, 100%, 50%)`;
          ctx.fillStyle = color;
          ctx.fillRect(x * tileSize + 6, y * tileSize + 6, tileSize - 12, tileSize - 12);
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.fillText(crop.type[0], x * tileSize + 10, y * tileSize + 20);
        }
      }
    }
    // 绘制所有小人
    const pad = Math.max(4, tileSize * 0.12);
    for (const e of entities) {
      // 闪烁效果：如果设置了 flashUntil，则在 1 秒内交替高亮
      const isFlashing = e.flashUntil && e.flashUntil > Date.now();
      const hatColor = HatColors[e.hat] || '#6bd36b';
      const blinkColor = '#fdd835'; // 高亮黄色
      const color = isFlashing && (Math.floor(Date.now() / 150) % 2 === 0) ? blinkColor : hatColor;
      ctx.fillStyle = color;
      const cy = mapSize - 1 - e.y; // 画布坐标的 y（翻转）
      const rx = e.x * tileSize + pad;
      const ry = cy * tileSize + pad;
      const rw = tileSize - pad*2;
      const rh = tileSize - pad*2;
      ctx.fillRect(rx, ry, rw, rh);
      if (e.id === activeEntityId) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2);
      }
    }
  }

  function animate(){
    drawMap();
    // 在每一帧结束时，回应所有挂起的 waitFrame 请求
    if (pendingFrameReqs.length && worker) {
      const reqs = pendingFrameReqs.splice(0, pendingFrameReqs.length);
      for (const reqId of reqs) {
        try { worker.postMessage({ type:'response', reqId, result: true }); } catch(_){}
      }
    }
    requestAnimationFrame(animate);
  }

  function move(direction, id){
    const e = getEntity(id);
    switch (direction) {
      // 左下为原点：向上 y 增加，向下 y 减少
      case 'up':    e.y++; break;
      case 'down':  e.y--; break;
      case 'left':  e.x--; break;
      case 'right': e.x++; break;
      default: throw new Error("未知方向: " + direction);
    }
    // 越界环绕：坐标映射回 [0, mapSize-1]
    const wrap = (v) => ((v % mapSize) + mapSize) % mapSize;
    e.x = wrap(e.x);
    e.y = wrap(e.y);
  }

  function plant(type, id){
    const e = getEntity(id);
    if(!cropTypes[type]) { msg.textContent = '未知作物 🌱'; return; }
    const key = `${e.x}_${e.y}`;
    if(crops[key]) { msg.textContent = '此格已有作物 ❌'; return; }
    crops[key] = { type, plantedAt: Date.now(), matureTime: cropTypes[type].time };
    msg.textContent = `${type} 已种下 🌾`;
  }

  function harvest(id){
    const e = getEntity(id);
    const key = `${e.x}_${e.y}`;
    const crop = crops[key];
    if(!crop){ msg.textContent = '这里没有作物 🌱'; return; }
    const elapsed = Date.now() - crop.plantedAt;
    if(elapsed < crop.matureTime){ msg.textContent = `${crop.type} 尚未成熟 ⏳`; return; }
    const itemKey = cropTypes[crop.type].item;
    e.Items[itemKey]++;
    delete crops[key];
    msg.textContent = `${crop.type} 已收获 ✅ (+1)`;
    updateInventory();
  }

  function spawn(){
    const newId = entities.length ? Math.max(...entities.map(x=>x.id)) + 1 : 0;
    const ref = getEntity(activeEntityId);
    entities.push({ id:newId, x:ref.x, y:ref.y, Items:{ potato:0, peanut:0, pumpkin:0, straw:0 }, hat: 'Straw_Hat' });
    msg.textContent = `新的小人已生成 👤 #${newId} 于 (${ref.x},${ref.y})`;
    return newId;
  }

  function setActive(id){
    const found = entities.find(e => e.id === id);
    if(found){
      activeEntityId = id;
      msg.textContent = `当前控制小人切换为 #${id}`;
      updateInventory();
    } else {
      msg.textContent = `未找到小人 #${id}`;
    }
  }

  function despawn(id){
    const idx = entities.findIndex(e => e.id === id);
    if (idx >= 0) {
      const removed = entities[idx];
      entities.splice(idx, 1);
      if (entities.length === 0) {
        // 保证至少有一个基础实体存在
        entities = [ { id: 0, x: 0, y: 0, Items: { potato:0, peanut:0, pumpkin:0, straw:0 }, hat: 'Straw_Hat' } ];
      }
      if (activeEntityId === removed.id) {
        activeEntityId = entities[0].id;
      }
      msg.textContent = `小人 #${removed.id} 已消失 🫥`;
      updateInventory();
    }
  }

  function reset(){
    entities = [ { id: 0, x: 0, y: 0, Items: { potato:0, peanut:0, pumpkin:0, straw:0 }, hat: 'Straw_Hat' } ];
    activeEntityId = 0;
    crops = {};
    msg.textContent = '已重置 ⟳';
    updateInventory();
  }

  function getTotalItems(){
    const totals = { potato:0, peanut:0, pumpkin:0, straw:0 };
    for (const e of entities) {
      totals.potato += (e.Items.potato||0);
      totals.peanut += (e.Items.peanut||0);
      totals.pumpkin += (e.Items.pumpkin||0);
      totals.straw += (e.Items.straw||0);
    }
    return totals;
  }

  function computeUnlocks(){
    if (!window.TECH_TREE) return {};
    const totals = getTotalItems();
    const sorted = window.TECH_TREE.slice().sort((a,b)=> (a.tier||0) - (b.tier||0));
    const unlockedByKey = {};
    for (const node of sorted) {
      const reqs = node.requires || {};
      const deps = node.deps || [];
      let itemsOk = true;
      for (const k of Object.keys(reqs)) {
        if ((totals[k]||0) < reqs[k]) { itemsOk = false; break; }
      }
      let depsOk = true;
      for (const d of deps) { if (!unlockedByKey[d]) { depsOk = false; break; } }
      unlockedByKey[node.key] = itemsOk && depsOk;
    }
    return unlockedByKey;
  }

  function updateTechTree(){
    if (!techGrid || !window.TECH_TREE) return;
    const totals = getTotalItems();
    techGrid.innerHTML = '';
    // 名称索引与按层级排序，保证依赖优先计算
    const nameByKey = {};
    for (const n of window.TECH_TREE) nameByKey[n.key] = n.name;
    const sorted = window.TECH_TREE.slice().sort((a,b)=> (a.tier||0) - (b.tier||0));
    const unlockedByKey = {};

    for (const node of sorted) {
      const card = document.createElement('div');
      card.className = 'tech-card';

      const name = document.createElement('div');
      name.className = 'tech-name';
      name.textContent = node.name;

      const status = document.createElement('div');
      status.className = 'tech-status';

      const reqs = node.requires || {};
      const deps = node.deps || [];

      // 物品进度判断
      let itemsOk = true;
      for (const k of Object.keys(reqs)) {
        if ((totals[k]||0) < reqs[k]) { itemsOk = false; break; }
      }

      // 依赖解锁判断（基于已计算的前置层级）
      let depsOk = true;
      for (const d of deps) {
        if (!unlockedByKey[d]) { depsOk = false; break; }
      }

      const ok = itemsOk && depsOk;
      unlockedByKey[node.key] = ok;
      status.textContent = ok ? '已解锁 ✅' : '未解锁 🔒';

      // 需求进度显示
      const req = document.createElement('div');
      req.className = 'req';
      const entries = Object.entries(reqs);
      req.textContent = entries.map(([k,v]) => {
        const cur = totals[k]||0;
        return `${k}(${cur}/${v})`;
      }).join(' · ');

      // 依赖徽章显示
      if (deps.length) {
        const depsWrap = document.createElement('div');
        depsWrap.className = 'deps';
        for (const d of deps) {
          const chip = document.createElement('span');
          chip.className = 'dep-badge ' + (unlockedByKey[d] ? 'ok' : 'need');
          chip.textContent = nameByKey[d] || d;
          depsWrap.appendChild(chip);
        }
        card.appendChild(depsWrap);
      }

      card.appendChild(name);
      card.appendChild(status);
      card.appendChild(req);
      techGrid.appendChild(card);
    }
  }

  function toggleTech(show){
    if (!techOverlay) return;
    techOverlay.style.display = show ? 'block' : 'none';
  }

  function handleWorkerCall({name, args, reqId}){
    switch (name) {
      case 'move': {
        move(args[0], args[1]);
        if (reqId != null) {
          const e = getEntity(args && args[1] != null ? args[1] : activeEntityId);
          worker && worker.postMessage({ type:'response', reqId, result: { id: e.id, x: e.x, y: e.y } });
          return;
        }
        break;
      }
      case 'plant': {
        plant(args[0], args[1]);
        if (reqId != null) {
          worker && worker.postMessage({ type:'response', reqId, result: true });
          return;
        }
        break;
      }
      case 'harvest': {
        harvest(args[0]);
        if (reqId != null) {
          worker && worker.postMessage({ type:'response', reqId, result: true });
          return;
        }
        break;
      }
      case 'spawn': {
        const id = spawn();
        worker && worker.postMessage({ type:'response', reqId, result: id });
        return;
      }
      case 'despawn': {
        despawn(args[0]);
        break;
      }
      case 'setActive': setActive(args[0]); break;
      case 'getPlayer': {
        const e = getEntity(activeEntityId);
        worker && worker.postMessage({ type:'response', reqId, result: { id: e.id, x: e.x, y: e.y, Items: { ...e.Items } } });
        return;
      }
      case 'getEntity': {
        const e = getEntity(args && args[0] != null ? args[0] : activeEntityId);
        worker && worker.postMessage({ type:'response', reqId, result: { id: e.id, x: e.x, y: e.y, Items: { ...e.Items } } });
        return;
      }
      case 'waitFrame': {
        if (reqId != null) { pendingFrameReqs.push(reqId); return; }
        break;
      }
      case 'change_hat': {
        const hatKey = args && args[0];
        const id = args && args[1] != null ? args[1] : activeEntityId;
        const e = getEntity(id);
        e.hat = typeof hatKey === 'string' ? hatKey : 'Straw_Hat';
        if (reqId != null) { worker && worker.postMessage({ type:'response', reqId, result: true }); return; }
        break;
      }
      case 'changeHat': {
        const hatKey = args && args[0];
        const id = args && args[1] != null ? args[1] : activeEntityId;
        const e = getEntity(id);
        e.hat = typeof hatKey === 'string' ? hatKey : 'Straw_Hat';
        if (reqId != null) { worker && worker.postMessage({ type:'response', reqId, result: true }); return; }
        break;
      }
      case 'doAFlip': {
        const id = args && args[0] != null ? args[0] : activeEntityId;
        const e = getEntity(id);
        e.flashUntil = Date.now() + 1000;
        if (reqId != null) {
          worker && worker.postMessage({ type:'response', reqId, result: true });
          return;
        }
        break;
      }
      case 'do_a_flip': {
        const id = args && args[0] != null ? args[0] : activeEntityId;
        const e = getEntity(id);
        e.flashUntil = Date.now() + 1000;
        if (reqId != null) {
          worker && worker.postMessage({ type:'response', reqId, result: true });
          return;
        }
        break;
      }
      case 'isUnlocked': {
        const m = computeUnlocks();
        const key = args && args[0];
        worker && worker.postMessage({ type:'response', reqId, result: !!m[key] });
        return;
      }
      default: break;
    }
    if (reqId != null) worker && worker.postMessage({ type:'response', reqId, result: null });
  }

  function runUserCode(){
    msg.textContent = '运行中…';
    setRunning(true);
    const code = editor.getValue();
    if (worker) { try { worker.terminate(); } catch(_){} worker = null; }
    worker = new Worker('runner.js');
    worker.onmessage = (e) => {
      const data = e.data;
      if (!data) return;
      if (data.type === 'call') {
        handleWorkerCall(data);
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
      } else if (data.type === 'response') {
        // response only used to resolve promises in worker, no UI work here
        // forwarded by worker itself
      }
    };
    worker.postMessage({ type: 'run', code });

    clearTimeout(runTimeoutHandle);
    if (runTimeoutMs > 0) {
      runTimeoutHandle = setTimeout(() => {
        if (worker) {
          try { worker.terminate(); } catch(_){}
          worker = null;
          setRunning(false);
          msg.textContent = '运行超时 ⏱ 已安全终止';
        }
      }, runTimeoutMs);
    }
  }
  function onRunButtonClick(){ if (isRunning) { abortRun(); } else { runUserCode(); } }
  runBtn && runBtn.addEventListener('click', onRunButtonClick);
  document.getElementById('reset').addEventListener('click', reset);
  if (techToggleBtn) techToggleBtn.addEventListener('click', ()=>{ updateTechTree(); toggleTech(true); });
  if (techCloseBtn) techCloseBtn.addEventListener('click', ()=> toggleTech(false));

  // 运行超时配置输入
  const timeoutInput = document.getElementById('timeout-ms');
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
  animate();
}