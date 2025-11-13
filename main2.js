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

  // 使用 PixiJS 初始化渲染
  const canvasEl = document.getElementById('map');
  const viewW = (canvasEl && canvasEl.width) ? canvasEl.width : 400;
  const viewH = (canvasEl && canvasEl.height) ? canvasEl.height : 400;
  // 使用透明画布以便素材透明背景完全透出（仍保留页面上 CSS 背景）
  const app = new PIXI.Application({ width: viewW, height: viewH, backgroundColor: 0x333333, backgroundAlpha: 0, antialias: true });
  // 保持原有 id 与样式
  app.view.id = 'map';
  if (canvasEl && canvasEl.parentNode) { canvasEl.parentNode.replaceChild(app.view, canvasEl); }
  const mapSize = 10;
  let tileSize = app.view.width / mapSize;
  // 全局数据由游戏框架管理：全局背包 items
  app.state = app.state || {};
  app.state.items = app.state.items || { potato:1000, peanut:1000, pumpkin:1000, straw:1000 };
  // 科技等级：各节点当前等级，默认 0
  app.state.techLevels = app.state.techLevels || {};
  // 全局数据：棋盘（作物）与解锁状态
  app.state.crops = app.state.crops || {};
  app.state.unlocks = app.state.unlocks || {};
  // Pixi 图层：网格、作物、实体
  const gridLayer = new PIXI.Graphics();
  const cropsLayer = new PIXI.Container();
  const entitiesLayer = new PIXI.Container();
  app.stage.addChild(gridLayer);
  app.stage.addChild(cropsLayer);
  app.stage.addChild(entitiesLayer);
  // 无人机动画速度与白底去除滤镜（可配置）
  window.DRONE_ANIM_SPEED = typeof window.DRONE_ANIM_SPEED === 'number' ? window.DRONE_ANIM_SPEED : 0.3;
  window.DRONE_BG_TOLERANCE = typeof window.DRONE_BG_TOLERANCE === 'number' ? window.DRONE_BG_TOLERANCE : 0.08; // 色差容差
  window.DRONE_BG_BRIGHTNESS = typeof window.DRONE_BG_BRIGHTNESS === 'number' ? window.DRONE_BG_BRIGHTNESS : 0.93; // 亮度阈值
  function createWhiteBgKillFilter(tol, thr){
    const frag = `
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float tol; // 色差容差
      uniform float thr; // 亮度阈值
      void main(){
        vec4 c = texture2D(uSampler, vTextureCoord);
        float brightness = (c.r + c.g + c.b) / 3.0;
        float chromaDiff = (abs(c.r - c.g) + abs(c.g - c.b) + abs(c.r - c.b)) / 3.0;
        float brightScore = smoothstep(thr, thr + 0.02, brightness);
        float chromaScore = 1.0 - smoothstep(tol, tol + 0.02, chromaDiff);
        float whiteness = clamp(brightScore * chromaScore, 0.0, 1.0);
        float alpha = c.a * (1.0 - whiteness);
        gl_FragColor = vec4(c.rgb, alpha);
      }
    `;
    return new PIXI.Filter(undefined, frag, { tol, thr });
  }
  const droneBgFilter = createWhiteBgKillFilter(window.DRONE_BG_TOLERANCE, window.DRONE_BG_BRIGHTNESS);
  // 无人机帧动画缓存：根据贴图实际尺寸自动检测布局（可用 window.DRONE_SHEET_LAYOUT 覆盖）
  // 允许覆盖精灵表路径（便于切换到透明背景素材或版本号破缓存）
  window.DRONE_SHEET_URL = typeof window.DRONE_SHEET_URL === 'string' && window.DRONE_SHEET_URL.length ? window.DRONE_SHEET_URL : 'asset/image/drone.png';
  let droneFramesMeta = null;
  function getDroneFramesMeta(){
    if (droneFramesMeta) return droneFramesMeta;
    const sheetTex = PIXI.BaseTexture.from(window.DRONE_SHEET_URL);
    const total = 8;
    const pairs = [[1,8],[2,4],[4,2],[8,1]];
    // 若用户提供布局覆盖，例如 [4,2]
    let overrideCols = 0, overrideRows = 0;
    if (Array.isArray(window.DRONE_SHEET_LAYOUT) && window.DRONE_SHEET_LAYOUT.length === 2){
      overrideCols = Math.max(1, Number(window.DRONE_SHEET_LAYOUT[0])||0);
      overrideRows = Math.max(1, Number(window.DRONE_SHEET_LAYOUT[1])||0);
    }
    let cols = 4, rows = 2; // 默认值
    if (sheetTex.valid) {
      const sw = sheetTex.width;
      const sh = sheetTex.height;
      if (overrideCols && overrideRows) {
        cols = overrideCols; rows = overrideRows;
      } else {
        let best = null;
        for (const [c,r] of pairs){
          const fw = sw / c;
          const fh = sh / r;
          const intFw = Math.abs(Math.round(fw) - fw) < 0.01;
          const intFh = Math.abs(Math.round(fh) - fh) < 0.01;
          const score = Math.abs(fw - fh);
          if (intFw && intFh) {
            if (!best || score < best.score) best = {c,r,fw,fh,score};
          }
        }
        if (best) { cols = best.c; rows = best.r; }
      }
      const frameWOverride = (Array.isArray(window.DRONE_FRAME_SIZE) && window.DRONE_FRAME_SIZE.length === 2) ? Math.max(1, Number(window.DRONE_FRAME_SIZE[0])||0) : 0;
      const frameHOverride = (Array.isArray(window.DRONE_FRAME_SIZE) && window.DRONE_FRAME_SIZE.length === 2) ? Math.max(1, Number(window.DRONE_FRAME_SIZE[1])||0) : 0;
      const spacing = typeof window.DRONE_FRAME_SPACING === 'number' ? Math.max(0, window.DRONE_FRAME_SPACING) : 0;
      const marginX = (Array.isArray(window.DRONE_FRAME_MARGIN) && window.DRONE_FRAME_MARGIN.length >= 1) ? Math.max(0, Number(window.DRONE_FRAME_MARGIN[0])||0) : 0;
      const marginY = (Array.isArray(window.DRONE_FRAME_MARGIN) && window.DRONE_FRAME_MARGIN.length >= 2) ? Math.max(0, Number(window.DRONE_FRAME_MARGIN[1])||0) : 0;
      const frameW = frameWOverride || Math.floor(sw / cols);
      const frameH = frameHOverride || Math.floor(sh / rows);
      const frames = [];
      for (let i = 0; i < total; i++){
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = marginX + col * (frameW + spacing);
        const y = marginY + row * (frameH + spacing);
        const rect = new PIXI.Rectangle(x, y, frameW, frameH);
        frames.push(new PIXI.Texture(sheetTex, rect));
      }
      droneFramesMeta = { frames, size: Math.min(frameW, frameH) };
    } else {
      // 贴图尚未有效：先使用保守的 4×2/256 作为占位，贴图更新后会自动纠正
      const size = 256;
      const frames = [];
      for (let i = 0; i < total; i++){
        const col = i % 4;
        const row = Math.floor(i / 4);
        const rect = new PIXI.Rectangle(col * size, row * size, size, size);
        frames.push(new PIXI.Texture(sheetTex, rect));
      }
      droneFramesMeta = { frames, size };
      // 当贴图有效时重建帧（异步修正）
      sheetTex.once('update', () => { droneFramesMeta = null; try{ rebuildAllDroneSprites(); }catch(_){} });
    }
    return droneFramesMeta;
  }
  // 贴图更新后，重建现有无人机精灵的帧与相关属性
  function rebuildAllDroneSprites(){
    const meta = getDroneFramesMeta();
    // entitySprites 在后续声明，这里在运行时可见
    if (!meta) return;
    try {
      for (const entry of entitySprites.values()){
        entry.sprite.textures = meta.frames;
        entry.frameSize = meta.size;
        // 保持速度与滤镜
        entry.sprite.animationSpeed = window.DRONE_ANIM_SPEED;
        entry.sprite.filters = [droneBgFilter];
        entry.sprite.gotoAndPlay(0);
      }
    } catch(_){ }
  }
  // 缓存实体对应的无人机精灵，避免每帧重建
  const entitySprites = new Map();
  const consoleOut = document.getElementById('console-output');
  const techOverlay = document.getElementById('tech-overlay');
  const techGraph = document.getElementById('tech-graph');
  const techToggleBtn = document.getElementById('toggle-tech');
  const techCloseBtn = document.getElementById('tech-close');
  const runBtn = document.getElementById('run');
  // 科技树 Pixi 渲染实例（独立于游戏地图）
  let techApp = null;
  window.USE_PIXI_TECH = true;
  // 强制无人机精灵表布局为 4×2（每行 4 张，共 2 行）
  window.DRONE_SHEET_LAYOUT = [4, 2];
  // 无人机锚点（默认略下移，使视觉中心更靠近机身）
  window.DRONE_ANCHOR = Array.isArray(window.DRONE_ANCHOR) && window.DRONE_ANCHOR.length === 2 ? window.DRONE_ANCHOR : [0.5, 0.6];
  // 土豆雪碧图（固定 1024×256，4 帧，每帧 256×256）
  window.POTATO_SHEET_URL = (typeof window.POTATO_SHEET_URL === 'string' && window.POTATO_SHEET_URL.length)
    ? window.POTATO_SHEET_URL : 'asset/image/potato.png';
  const POTATO_ANCHOR = [0.5, 0.85];
  let potatoFramesMeta = null;
  function getPotatoFramesMeta(){
    if (potatoFramesMeta) return potatoFramesMeta;
    const sheetTex = PIXI.BaseTexture.from(window.POTATO_SHEET_URL);
    const size = 256;
    const frames = [];
    for (let i = 0; i < 4; i++){
      frames.push(new PIXI.Texture(sheetTex, new PIXI.Rectangle(i * size, 0, size, size)));
    }
    potatoFramesMeta = { frames, size };
    if (!sheetTex.valid) {
      sheetTex.once('update', () => { potatoFramesMeta = null; });
    }
    return potatoFramesMeta;
  }

  // 多实体支持：entities[ {id,x,y,Items,hat} ]
  let entities = [ { id: 0, x: 0, y: 0, Items: { potato:0, peanut:0, pumpkin:0, straw:0 }, hat: 'Straw_Hat' } ];
  let activeEntityId = 0;
  let crops = app.state.crops; // {"x_y": {type, plantedAt, matureTime}}
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

  // 辅助：CSS hex 转 int；HSL 转 int
  function cssHexToInt(hex){
    if (typeof hex === 'string' && hex.startsWith('#')){ return parseInt(hex.slice(1), 16); }
    return 0x6bd36b;
  }
  function hslToInt(h, s, l){
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r=0, g=0, b=0;
    if (hp >= 0 && hp < 1){ r=c; g=x; b=0; }
    else if (hp < 2){ r=x; g=c; b=0; }
    else if (hp < 3){ r=0; g=c; b=x; }
    else if (hp < 4){ r=0; g=x; b=c; }
    else if (hp < 5){ r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }
    const m = l - c/2;
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return (r << 16) | (g << 8) | b;
  }

  // 静态绘制网格一次
  gridLayer.clear();
  gridLayer.lineStyle(1, 0x555555, 1);
  for (let y = 0; y < mapSize; y++) {
    for (let x = 0; x < mapSize; x++) {
      gridLayer.drawRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

 const cropSprites = new Map(); // 缓存每个格子的精灵

 function smooth(obj, prop, target, factor = 0.15) {
  obj[prop] += (target - obj[prop]) * factor;
}

function smoothScale(sprite, targetScale, factor = 0.18) {
  sprite.scale.x += (targetScale - sprite.scale.x) * factor;
  sprite.scale.y += (targetScale - sprite.scale.y) * factor;
}

function tweenAlpha(sprite, target, duration) {
  const start = sprite.alpha;
  const delta = target - start;
  const startTime = performance.now();

  function update() {
    const t = (performance.now() - startTime) / duration;
    if (t >= 1) {
      sprite.alpha = target;
      return;
    }
    sprite.alpha = start + delta * t;
    requestAnimationFrame(update);
  }

  update();
}

function tweenScale(sprite, target, duration) {
  const start = sprite.scale.x;
  const delta = target - start;
  const startTime = performance.now();

  function update() {
    const t = (performance.now() - startTime) / duration;
    if (t >= 1) {
      sprite.scale.set(target);
      return;
    }
    const v = start + delta * t;
    sprite.scale.set(v);
    requestAnimationFrame(update);
  }

  update();
}

function drawMap(){
  const now = Date.now();
  const seen = new Set();

  for (let screenY = 0; screenY < mapSize; screenY++) {
    for (let x = 0; x < mapSize; x++) {
      const ly = mapSize - 1 - screenY;
      const key = `${x}_${ly}`;
      const crop = crops[key];

      if (!crop) continue;
      seen.add(key);

      const elapsed = now - crop.plantedAt;
      const progress = Math.min(elapsed / crop.matureTime, 1);

      if (crop.type === '土豆') {
        const meta = getPotatoFramesMeta();
        const newIdx = Math.min(meta.frames.length - 1, Math.floor(progress * meta.frames.length));

        const pad = Math.max(6, tileSize * 0.12);
        const maxSide = Math.max(8, tileSize - pad*2);
        const targetScale = Math.min(maxSide / (meta.size || 256), 1);

        const offsetY = tileSize * 0.15;
        const targetX = Math.round(x * tileSize + tileSize/2);
        const targetY = Math.round(screenY * tileSize + tileSize - offsetY);

        let entry = cropSprites.get(key);

        // ---- 第一次创建 ----
        if (!entry) {
          const sprite = new PIXI.Sprite(meta.frames[newIdx]);
          sprite.anchor.set(0.5, 1);
          sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

          sprite.x = targetX;
          sprite.y = targetY;
          sprite.alpha = 0; // 淡入效果
          sprite.scale.set(targetScale * 0.85); // 初始更小一点 → 有生长感

          cropsLayer.addChild(sprite);

          entry = { sprite, frameIdx: newIdx };
          cropSprites.set(key, entry);

          // 淡入
          tweenAlpha(sprite, 1, 150);
          tweenScale(sprite, targetScale, 200);

          continue;
        }

        // ---- 已存在 sprite，检查是否换帧 ----
        const sprite = entry.sprite;

        if (entry.frameIdx !== newIdx) {
          // 旧 sprite 淡出
          tweenAlpha(sprite, 0, 150);
          setTimeout(() => {
            cropsLayer.removeChild(sprite);
          }, 150);

          // 新 sprite
          const newSprite = new PIXI.Sprite(meta.frames[newIdx]);
          newSprite.anchor.set(0.5, 1);
          newSprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
          newSprite.x = targetX;
          newSprite.y = targetY;
          newSprite.alpha = 0;
          newSprite.scale.set(targetScale * 0.85);
          cropsLayer.addChild(newSprite);

          cropSprites.set(key, { sprite: newSprite, frameIdx: newIdx });

          tweenAlpha(newSprite, 1, 150);
          tweenScale(newSprite, targetScale, 200);
        } else {
          // ---- 帧未变，执行平滑移动、缩放 ----
          smooth(sprite, 'x', targetX);
          smooth(sprite, 'y', targetY);
          smoothScale(sprite, targetScale);
        }
      }
    }
  }

  // ---- 清理消失的 ----
  for (const [key, entry] of cropSprites.entries()) {
    if (!seen.has(key)) {
      cropsLayer.removeChild(entry.sprite);
      cropSprites.delete(key);
    }
  }

  // 实体逻辑不动
  // ...
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
    // 基础产量为 1；若为南瓜，受对应科技等级影响
    const levels = (app && app.state && app.state.techLevels) ? app.state.techLevels : {};
    const pumpkinLvl = Number(levels['pumpkin'] || 0);
    const yieldQty = (itemKey === 'pumpkin') ? (1 + pumpkinLvl) : 1;
    e.Items[itemKey] = (e.Items[itemKey] || 0) + yieldQty;
    if (app && app.state && app.state.items && itemKey in app.state.items) {
      app.state.items[itemKey] = (app.state.items[itemKey] || 0) + yieldQty;
    }
    delete crops[key];
    msg.textContent = `${crop.type} 已收获 ✅ (+${yieldQty})`;
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
    if (app && app.state) {
      app.state.crops = {};
      app.state.unlocks = {};
      app.state.techLevels = {};
      crops = app.state.crops;
    }
    if (app && app.state) {
      app.state.items = { potato:1000, peanut:1000, pumpkin:1000, straw:1000 };
    }
    msg.textContent = '已重置 ⟳';
    updateInventory();
  }

  function getTotalItems(){
    if (app && app.state && app.state.items) {
      return { ...app.state.items };
    }
    const totals = { potato:0, peanut:0, pumpkin:0, straw:0 };
    for (const e of entities) {
      totals.potato += (e.Items.potato||0);
      totals.peanut += (e.Items.peanut||0);
      totals.pumpkin += (e.Items.pumpkin||0);
      totals.straw += (e.Items.straw||0);
    }
    return totals;
  }

  // 计算“可解锁”状态（不自动写入解锁结果）
  function computeEligibility(){
    if (!window.TECH_TREE) return {};
    const totals = getTotalItems();
    const eligibleByKey = {};
    const unlocked = (app && app.state && app.state.unlocks) ? app.state.unlocks : {};
    const sorted = window.TECH_TREE.slice().sort((a,b)=> (a.tier||0) - (b.tier||0));
    for (const node of sorted) {
      const reqs = node.requires || {};
      const deps = node.deps || [];
      let itemsOk = true;
      for (const k of Object.keys(reqs)) {
        if ((totals[k]||0) < reqs[k]) { itemsOk = false; break; }
      }
      let depsOk = true;
      for (const d of deps) { if (!unlocked[d]) { depsOk = false; break; } }
      eligibleByKey[node.key] = itemsOk && depsOk;
    }
    return eligibleByKey;
  }

  function canUnlock(node){
    const totals = getTotalItems();
    const unlocked = (app && app.state && app.state.unlocks) ? app.state.unlocks : {};
    const reqs = node.requires || {};
    const deps = node.deps || [];
    for (const k of Object.keys(reqs)) {
      if ((totals[k]||0) < reqs[k]) return false;
    }
    for (const d of deps) { if (!unlocked[d]) return false; }
    return true;
  }

  // 获取科技等级
  function getTechLevel(key){
    if (!app || !app.state) return 0;
    const levels = app.state.techLevels || {};
    return Number(levels[key] || 0);
  }

  // 判断可升级（已解锁，未满级，资源足够）
  function canUpgrade(node){
    const maxLv = Number(node.maxLevel || 0);
    if (!maxLv) return false;
    const unlocked = (app && app.state && app.state.unlocks) ? app.state.unlocks : {};
    if (!unlocked[node.key]) return false;
    const curLv = getTechLevel(node.key);
    if (curLv >= maxLv) return false;
    const totals = getTotalItems();
    const reqs = node.requires || {};
    for (const k of Object.keys(reqs)) {
      if ((totals[k]||0) < reqs[k]) return false;
    }
    return true;
  }

  // 升级科技：消耗与解锁相同的需求，等级 +1
  function upgradeTech(node){
    if (!app || !app.state) return false;
    const maxLv = Number(node.maxLevel || 0);
    if (!maxLv) return false;
    if (!app.state.unlocks || !app.state.unlocks[node.key]) return false;
    const curLv = getTechLevel(node.key);
    if (curLv >= maxLv) { msg.textContent = `${node.name} 已满级 ⭐`; return false; }
    if (!canUpgrade(node)) { msg.textContent = `升级条件不足：${node.name}`; return false; }
    const reqs = node.requires || {};
    const items = app.state.items || {};
    for (const [k, v] of Object.entries(reqs)) {
      const need = Number(v) || 0;
      const cur = Number(items[k] || 0);
      items[k] = Math.max(0, cur - need);
    }
    app.state.items = items;
    const levels = app.state.techLevels || {};
    levels[node.key] = curLv + 1;
    app.state.techLevels = levels;
    msg.textContent = `已升级：${node.name} Lv.${levels[node.key]} / ${maxLv} ⬆️`;
    updateInventory();
    return true;
  }

  function unlockTech(node){
    if (!app || !app.state) return false;
    if (!app.state.unlocks) app.state.unlocks = {};
    if (app.state.unlocks[node.key]) return true; // 已解锁
    if (!canUnlock(node)) return false;
    // 消耗全局背包物品
    const reqs = node.requires || {};
    const items = app.state.items || {};
    for (const [k, v] of Object.entries(reqs)) {
      const need = Number(v) || 0;
      const cur = Number(items[k] || 0);
      items[k] = Math.max(0, cur - need);
    }
    app.state.items = items;
    app.state.unlocks[node.key] = true;
    msg.textContent = `已解锁科技：${node.name} ✅`;    
    // 更新背包显示与科技树状态
    updateInventory();
    return true;
  }

  function updateTechTree(){
    if (!techGraph || !window.TECH_TREE) return;
    const totals = getTotalItems();
    const techScroll = document.getElementById('tech-scroll');
    const prevScrollTop = techScroll ? techScroll.scrollTop : 0;
    const prevClientH = techScroll ? techScroll.clientHeight : 0;
    const prevScrollH = techScroll ? techScroll.scrollHeight : 0;
    const prevMax = Math.max(1, prevScrollH - prevClientH);
    const prevRatio = prevMax > 0 ? (prevScrollTop / prevMax) : 0;
    const cardW = 360;
    const cardH = 200;
    const graphW = techGraph.clientWidth || techGraph.getBoundingClientRect().width || 800;
    const graphH = techGraph.clientHeight || techGraph.getBoundingClientRect().height || 600;

    // 移除旧的 DOM 节点，避免与 Pixi 重叠
    const oldNodes = techGraph.querySelectorAll('.tech-node');
    oldNodes.forEach(n => n.remove());
    if (window.USE_PIXI_TECH) {
      // Pixi 路径：不使用 DOM 节点与 SVG
      const levels = [];
      const nameByKey = {};
      const eligibleByKey = computeEligibility();
      const sorted = window.TECH_TREE.slice().sort((a,b)=> (a.tier||0) - (b.tier||0));
      for (const n of sorted) nameByKey[n.key] = n.name;
      for (const node of sorted){ const t = node.tier || 0; if (!levels[t]) levels[t] = []; levels[t].push(node); }
      const marginX = 20;
      const marginY = 16;
      const levelCount = Math.max(1, levels.length);
      const levelSpacingY = cardH + 120;
      const pos = {};
      const countByLevel = levels.map(row => Math.max(1, (row||[]).length));
      const stepXByLevel = countByLevel.map(count => (graphW - marginX*2) / Math.max(1, count + 0.8));
      for (let l = 0; l < levelCount; l++){
        const row = levels[l] || [];
        const stepX = stepXByLevel[l];
        for (let i=0;i<row.length;i++){
          const node = row[i];
          const nx = marginX + stepX * (i + 0.5);
          const ny = marginY + levelSpacingY * l + 10;
          pos[node.key] = {x:nx,y:ny};
        }
      }
      const maxY = Object.values(pos).reduce((m,p)=>Math.max(m,p.y),0);
      const contentH = Math.max(graphH, Math.round(maxY + cardH/2 + 60));
      techGraph.style.height = `${contentH}px`;

      // 初始化或调整 Pixi 应用
      if (!techApp){
        techApp = new PIXI.Application({ width: Math.round(graphW), height: Math.round(contentH), backgroundAlpha: 0, antialias: true, resolution: Math.max(1, window.devicePixelRatio || 1) });
        techApp.view.id = 'tech-canvas';
        techGraph.appendChild(techApp.view);
        // 画布占满容器宽度，并以 CSS 设定高度，避免显示偏小
        techApp.view.style.width = '100%';
        techApp.view.style.height = `${Math.round(contentH)}px`;
        techApp.view.style.display = 'block';
      } else {
        techApp.renderer.resize(Math.round(graphW), Math.round(contentH));
        techApp.view.style.width = '100%';
        techApp.view.style.height = `${Math.round(contentH)}px`;
      }
      techApp.stage.removeChildren();
      const g = new PIXI.Graphics();
      techApp.stage.addChild(g);
      // 连线（加粗并绘制箭头）
      for (const node of sorted){
        const deps = node.deps || [];
        const p2 = pos[node.key];
        for (const d of deps){
          const p1 = pos[d];
          if (!p1 || !p2) continue;
          const midY = (p1.y + p2.y) / 2;
          const ok = !!(app.state && app.state.unlocks && app.state.unlocks[d]);
          g.lineStyle(4, ok ? 0x2d6a2d : 0x6a2d2d, 0.95);
          g.moveTo(p1.x, p1.y + cardH/2);
          g.bezierCurveTo(p1.x, midY, p2.x, midY, p2.x, p2.y - cardH/2);
          // 箭头三角形（方向与终点切线一致，垂直指向）
          const tipX = p2.x;
          const tipY = p2.y - cardH/2;
          const s = 12; // 箭头尺寸
          const arrowColor = ok ? 0x2d6a2d : 0x6a2d2d;
          g.beginFill(arrowColor, 0.95);
          g.moveTo(tipX, tipY);
          g.lineTo(tipX - s*0.6, tipY - s);
          g.lineTo(tipX + s*0.6, tipY - s);
          g.lineTo(tipX, tipY);
          g.endFill();
        }
      }
      // 节点卡片
      for (const node of sorted){
        const isUnlocked = !!(app.state && app.state.unlocks && app.state.unlocks[node.key]);
        const isEligible = !!eligibleByKey[node.key];
        const maxLv = Number(node.maxLevel || 0);
        const curLv = getTechLevel(node.key);
        const clickable = (!isUnlocked && isEligible) || (isUnlocked && canUpgrade(node));
        const p = pos[node.key];
        const x = Math.round(p.x - cardW/2);
        const y = Math.round(p.y - cardH/2);
        const rect = new PIXI.Graphics();
        rect.lineStyle(1, isUnlocked ? 0x2d6a2d : 0x6a2d2d, 1);
        rect.beginFill(0x1f1f1f, 1);
        rect.drawRoundedRect(x, y, cardW, cardH, 10);
        rect.endFill();
        rect.interactive = clickable;
        rect.buttonMode = clickable;
        rect.on('pointertap', () => {
          const nowUnlocked = !!(app.state && app.state.unlocks && app.state.unlocks[node.key]);
          if (!nowUnlocked) {
            if (unlockTech(node)) return;
            msg.textContent = `解锁条件不足：${node.name}`;
            return;
          }
          if ((node.maxLevel||0) > 0) {
            if (upgradeTech(node)) return;
            return;
          }
          msg.textContent = `科技已解锁：${node.name}`;
        });
        techApp.stage.addChild(rect);

        const nameText = new PIXI.Text(node.name, { fill:'#eeeeee', fontSize: 22, fontWeight: '600' });
        nameText.x = x + Math.round((cardW - nameText.width)/2);
        nameText.y = y + 12;
        techApp.stage.addChild(nameText);
        const statusText = new PIXI.Text((()=>{
          if (!isUnlocked) return isEligible ? '可解锁 ⏳' : '未解锁 🔒';
          if (maxLv > 0){
            const upOk = canUpgrade(node);
            return `已解锁 ✅ · Lv.${curLv}/${maxLv}` + (curLv < maxLv ? (upOk ? ' · 可升级 ⬆️' : ' · 待升级') : ' · 已满级 ⭐');
          }
          return '已解锁 ✅';
        })(), { fill:'#cccccc', fontSize: 16 });
        statusText.x = x + Math.round((cardW - statusText.width)/2);
        statusText.y = y + 60;
        techApp.stage.addChild(statusText);
        const reqText = new PIXI.Text(Object.entries(node.requires||{}).map(([k,v])=>`${k} × ${v}`).join(' · '), { fill:'#cccccc', fontSize: 16 });
        reqText.x = x + Math.round((cardW - reqText.width)/2);
        reqText.y = y + 96;
        techApp.stage.addChild(reqText);
      }
      // 恢复滚动位置
      if (techScroll) {
        const newClientH = techScroll.clientHeight;
        const newScrollH = techScroll.scrollHeight;
        const newMax = Math.max(1, newScrollH - newClientH);
        const target = Math.round(prevRatio * newMax);
        techScroll.scrollTop = Number.isFinite(target) ? target : prevScrollTop;
      }
      return;
    }

    // DOM+SVG 路径（旧实现）
    // 上面已清理旧节点
    if (techSvg) {
      techSvg.setAttribute('width', Math.max(1, Math.round(graphW)));
      techSvg.setAttribute('height', Math.max(1, Math.round(graphH)));
      while (techSvg.firstChild) techSvg.removeChild(techSvg.firstChild);
    }
    const nameByKey = {};
    for (const n of window.TECH_TREE) nameByKey[n.key] = n.name;
    const sorted = window.TECH_TREE.slice().sort((a,b)=> (a.tier||0) - (b.tier||0));
    const eligibleByKey = computeEligibility();

    // 分层：按 tier 分组
    const levels = [];
    for (const node of sorted) {
      const t = node.tier || 0;
      if (!levels[t]) levels[t] = [];
      levels[t].push(node);
    }
    const width = graphW;
    const marginX = 20;
    const marginY = 16;
    const levelCount = Math.max(1, levels.length);
    // 使用固定层距，避免因容器高度变化导致重排
    const levelSpacingY = cardH + 100; // 常量层距（与卡片高度相关）

    const pos = {};
    for (let l = 0; l < levelCount; l++) {
      const row = levels[l] || [];
      const count = Math.max(1, row.length);
      // 缩小同层节点水平间距：增大分母，让节点更靠近
      const stepX = (width - marginX*2) / Math.max(1, count + 0.8);
      for (let i = 0; i < row.length; i++) {
        const node = row[i];
        const nx = marginX + stepX * (i + 0.5);
        const ny = marginY + levelSpacingY * l + 10;
        pos[node.key] = { x: nx, y: ny };
        const el = document.createElement('div');
        const isUnlocked = !!(app.state && app.state.unlocks && app.state.unlocks[node.key]);
        const isEligible = !!eligibleByKey[node.key];
        const clickable = (!isUnlocked && isEligible) || (isUnlocked && canUpgrade(node));
        el.className = 'tech-node ' + (isUnlocked ? 'unlocked' : 'locked') + (clickable ? ' clickable' : '');
        el.style.left = `${Math.round(nx - cardW/2)}px`;
        el.style.top = `${Math.round(ny - cardH/2)}px`;
        const name = document.createElement('div');
        name.className = 'tech-name';
        name.textContent = node.name;
        const status = document.createElement('div');
        status.className = 'tech-status';
        const maxLv = Number(node.maxLevel || 0);
        const curLv = getTechLevel(node.key);
        if (!isUnlocked) {
          status.textContent = isEligible ? '可解锁 ⏳' : '未解锁 🔒';
        } else if (maxLv > 0) {
          const upOk = canUpgrade(node);
          status.textContent = `已解锁 ✅ · Lv.${curLv}/${maxLv}` + (curLv < maxLv ? (upOk ? ' · 可升级 ⬆️' : ' · 待升级') : ' · 已满级 ⭐');
        } else {
          status.textContent = '已解锁 ✅';
        }
        const req = document.createElement('div');
        req.className = 'req';
        const entries = Object.entries(node.requires || {});
        // 只显示需求数量，不显示当前拥有数量
        req.textContent = entries.map(([k,v]) => `${k} × ${v}`).join(' · ');
        el.appendChild(name);
        el.appendChild(status);
        el.appendChild(req);
        el.addEventListener('click', () => {
          const nowUnlocked = !!(app.state && app.state.unlocks && app.state.unlocks[node.key]);
          if (!nowUnlocked) {
            if (unlockTech(node)) return;
            msg.textContent = `解锁条件不足：${node.name}`;
            return;
          }
          if ((node.maxLevel||0) > 0) {
            if (upgradeTech(node)) return;
            return; // 升级失败时消息已设置
          }
          msg.textContent = `科技已解锁：${node.name}`;
        });
        techGraph.appendChild(el);
      }
    }

    // 根据节点实际位置设置内容高度，以启用滚动（Y 轴）
    const maxY = Object.values(pos).reduce((m, p) => Math.max(m, p.y), 0);
    const contentH = Math.max(graphH, Math.round(maxY + cardH/2 + 60));
    techGraph.style.height = `${contentH}px`;
    if (techSvg) {
      techSvg.setAttribute('height', contentH);
    }

    // 用 SVG 绘制依赖连线（贝塞尔曲线）
    if (techSvg) {
      // 定义箭头标记
      const svgNs = 'http://www.w3.org/2000/svg';
      const defs = document.createElementNS(svgNs, 'defs');
      // 绿色箭头（已满足依赖）
      const arrowGreen = document.createElementNS(svgNs, 'marker');
      arrowGreen.setAttribute('id', 'arrow-green');
      arrowGreen.setAttribute('markerWidth', '10');
      arrowGreen.setAttribute('markerHeight', '10');
      arrowGreen.setAttribute('refX', '9');
      arrowGreen.setAttribute('refY', '5');
      arrowGreen.setAttribute('orient', 'auto');
      arrowGreen.setAttribute('markerUnits', 'strokeWidth');
      arrowGreen.setAttribute('viewBox', '0 0 10 10');
      const agPath = document.createElementNS(svgNs, 'path');
      agPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 Z');
      agPath.setAttribute('fill', '#2d6a2d');
      agPath.setAttribute('stroke', 'none');
      arrowGreen.appendChild(agPath);
      // 红色箭头（未满足依赖）
      const arrowRed = document.createElementNS(svgNs, 'marker');
      arrowRed.setAttribute('id', 'arrow-red');
      arrowRed.setAttribute('markerWidth', '10');
      arrowRed.setAttribute('markerHeight', '10');
      arrowRed.setAttribute('refX', '9');
      arrowRed.setAttribute('refY', '5');
      arrowRed.setAttribute('orient', 'auto');
      arrowRed.setAttribute('markerUnits', 'strokeWidth');
      arrowRed.setAttribute('viewBox', '0 0 10 10');
      const arPath = document.createElementNS(svgNs, 'path');
      arPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 Z');
      arPath.setAttribute('fill', '#6a2d2d');
      arPath.setAttribute('stroke', 'none');
      arrowRed.appendChild(arPath);
      defs.appendChild(arrowGreen);
      defs.appendChild(arrowRed);
      techSvg.appendChild(defs);
      for (const node of sorted) {
        const deps = node.deps || [];
        const p2 = pos[node.key];
        for (const d of deps) {
          const p1 = pos[d];
          if (!p1 || !p2) continue;
          const midY = (p1.y + p2.y) / 2;
          const ok = !!(app.state && app.state.unlocks && app.state.unlocks[d]);
          const path = document.createElementNS('http://www.w3.org/2000/svg','path');
          const dAttr = `M ${p1.x} ${p1.y + cardH/2} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y - cardH/2}`;
          path.setAttribute('d', dAttr);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', ok ? '#2d6a2d' : '#6a2d2d');
          path.setAttribute('stroke-width', '2');
          path.setAttribute('opacity', '0.9');
          path.setAttribute('marker-end', ok ? 'url(#arrow-green)' : 'url(#arrow-red)');
          techSvg.appendChild(path);
        }
      }
    }
    if (techScroll) {
      const newClientH = techScroll.clientHeight;
      const newScrollH = techScroll.scrollHeight;
      const newMax = Math.max(1, newScrollH - newClientH);
      const target = Math.round(prevRatio * newMax);
      techScroll.scrollTop = Number.isFinite(target) ? target : prevScrollTop;
    }
  }

  function toggleTech(show){
    if (!techOverlay) return;
    techOverlay.style.display = show ? 'block' : 'none';
    // 在显示后再刷新，确保测量的是可见尺寸
    if (show) {
      requestAnimationFrame(()=> updateTechTree());
    }
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
        const key = args && args[0];
        const unlocked = (app && app.state && app.state.unlocks) ? app.state.unlocks : {};
        worker && worker.postMessage({ type:'response', reqId, result: !!unlocked[key] });
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
  if (techToggleBtn) techToggleBtn.addEventListener('click', ()=>{ toggleTech(true); });
  if (techCloseBtn) techCloseBtn.addEventListener('click', ()=> toggleTech(false));

  // 覆层为窗口级别：窗口尺寸变化时，如果覆层打开则重绘布局
  window.addEventListener('resize', () => {
    if (techOverlay && techOverlay.style.display !== 'none') {
      requestAnimationFrame(()=> updateTechTree());
    }
  });

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
  // 使用 Pixi 的 Ticker 驱动动画帧
  app.ticker.add(animate);
}