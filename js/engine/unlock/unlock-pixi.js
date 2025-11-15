// js/unlock/unlock-pixi.js

let techApp = null;

export function renderUnlockPixi(app, TECH_TREE, graphEl) {

  const unlockMgr = app.unlockManager;

  // 1. 按 tier 排序
  const sorted = TECH_TREE.slice().sort((a,b)=> (a.tier||0)-(b.tier||0));

  // 2. 预计算哪些节点“可解锁”
  const eligible = unlockMgr.computeEligibility();

  // 3. 按层级分组
  const levels = [];
  sorted.forEach(node => {
    const t = node.tier || 0;
    (levels[t] ||= []).push(node);
  });

  const cardW = 360, cardH = 200;
  const graphW = graphEl.clientWidth || 800;
  const levelH = cardH + 120;

  const pos = {};

  for (let l = 0; l < levels.length; l++) {
    const row = levels[l];
    if (!row || row.length === 0) continue;
    const count = row.length;
    const marginX = 20;
    const stepX = (graphW - marginX*2) / (count + 0.8);

    row.forEach((node, i) => {
      pos[node.key] = {
        x: marginX + stepX * (i + 0.5),
        y: 20 + levelH * l + 10
      };
    });
  }

  const maxY = Object.values(pos).reduce((m,p)=>Math.max(m,p.y),0);
  const contentH = maxY + cardH + 200;

  // 4. 初始化/更新 Pixi canvas
  if (!techApp) {
    techApp = new PIXI.Application({
      width: graphW,
      height: contentH,
      backgroundAlpha: 0,
      resolution: Math.max(1, window.devicePixelRatio),
      antialias: true
    });
    techApp.view.id = 'tech-canvas';
    graphEl.innerHTML = '';
    graphEl.appendChild(techApp.view);
  } else {
    techApp.renderer.resize(graphW, contentH);
  }

  // 清空画布
  techApp.stage.removeChildren();

  const g = new PIXI.Graphics();
  techApp.stage.addChild(g);

  // 5. 画依赖线
  for (const node of sorted) {
    const deps = node.deps || [];
    const p2 = pos[node.key];

    for (const d of deps) {
      const p1 = pos[d];
      if (!p1) continue;

      const ok = unlockMgr.isUnlocked(d);

      const midY = (p1.y + p2.y) / 2;

      g.lineStyle(4, ok ? 0x2d6a2d : 0x6a2d2d, 0.95);
      g.moveTo(p1.x, p1.y + cardH/2);
      g.bezierCurveTo(p1.x, midY, p2.x, midY, p2.x, p2.y - cardH/2);

      const tipX = p2.x, tipY = p2.y - cardH/2;
      const s = 12;
      g.beginFill(ok ? 0x2d6a2d : 0x6a2d2d);
      g.drawPolygon([
        tipX, tipY,
        tipX - s*0.6, tipY - s,
        tipX + s*0.6, tipY - s,
      ]);
      g.endFill();
    }
  }

  // 6. 画节点卡片
  for (const node of sorted) {

    const unlocked = unlockMgr.isUnlocked(node.key);
    const lv = unlockMgr.getLevel(node.key);
    const maxLv = node.maxLevel || 0;

    const canUnlock = eligible[node.key] && !unlocked;
    const canUpgrade = unlockMgr.canUpgrade(node.key);

    const p = pos[node.key];

    const card = new PIXI.Graphics();
    card.lineStyle(1, unlocked ? 0x2d6a2d : 0x6a2d2d);
    card.beginFill(0x1f1f1f);
    card.drawRoundedRect(p.x - cardW/2, p.y - cardH/2, cardW, cardH, 10);
    card.endFill();

    card.interactive = canUnlock || canUpgrade;
    card.buttonMode = card.interactive;

    // 点击事件：解锁 / 升级
    card.on('pointertap', () => {
      if (canUnlock) {
        if (unlockMgr.unlock(node.key)) {
          renderUnlockPixi(app, TECH_TREE, graphEl);
        }
        return;
      }

      if (canUpgrade) {
        if (unlockMgr.upgrade(node.key)) {
          renderUnlockPixi(app, TECH_TREE, graphEl);
        }
      }
    });

    techApp.stage.addChild(card);

    // 名称
    const nameT = new PIXI.Text(node.name, { fill:'#eee', fontSize:22, fontWeight:'600' });
    nameT.x = p.x - nameT.width/2;
    nameT.y = p.y - cardH/2 + 12;
    techApp.stage.addChild(nameT);

    // 状态文本
    const statusText = !unlocked
      ? (canUnlock ? '可解锁' : '未解锁')
      : (maxLv
        ? `Lv.${lv}/${maxLv}` + (lv < maxLv ? (canUpgrade ? ' · 可升级' : '') : '')
        : '已解锁');

    const statusT = new PIXI.Text(statusText, { fill:'#ccc', fontSize:16 });
    statusT.x = p.x - statusT.width/2;
    statusT.y = p.y - cardH/2 + 60;
    techApp.stage.addChild(statusT);

    // 需要的材料
    const reqStr = Object.entries(node.requires||{}).map(([k,v])=>`${k}×${v}`).join(' · ');
    const reqT = new PIXI.Text(reqStr, { fill:'#ccc', fontSize:16 });
    reqT.x = p.x - reqT.width/2;
    reqT.y = p.y - cardH/2 + 100;
    techApp.stage.addChild(reqT);
  }
}
