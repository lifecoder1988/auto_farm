// js/unlock/unlock-pixi.js
import {
  computeEligibility, isUnlocked, getTechLevel,
  canUpgrade, unlockTech, upgradeTech
} from './unlock-core.js';

let techApp = null;

export function renderUnlockPixi(app, TECH_TREE, graphEl) {
  const sorted = TECH_TREE.slice().sort((a,b)=> (a.tier||0)-(b.tier||0));
  const eligible = computeEligibility(app, TECH_TREE);

  const levels = [];
  sorted.forEach(n => {
    const t = n.tier || 0;
    (levels[t] ||= []).push(n);
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

  // init Pixi
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

  techApp.stage.removeChildren();

  const g = new PIXI.Graphics();
  techApp.stage.addChild(g);

  // 画依赖线
  for (const node of sorted) {
    const deps = node.deps || [];
    const p2 = pos[node.key];
    for (const d of deps) {
      const p1 = pos[d];
      if (!p1) continue;

      const ok = isUnlocked(app, d);
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

  // 节点卡片
  for (const node of sorted) {
    const unlocked = isUnlocked(app, node.key);
    const lv = getTechLevel(app, node.key);
    const maxLv = node.maxLevel || 0;
    const canUp = canUpgrade(app, node);
    const p = pos[node.key];

    const card = new PIXI.Graphics();
    card.lineStyle(1, unlocked ? 0x2d6a2d : 0x6a2d2d);
    card.beginFill(0x1f1f1f);
    card.drawRoundedRect(p.x - cardW/2, p.y - cardH/2, cardW, cardH, 10);
    card.endFill();
    card.interactive = (!unlocked && eligible[node.key]) || (unlocked && canUp);
    card.buttonMode = card.interactive;

    card.on('pointertap', () => {
      if (!unlocked) {
        if (unlockTech(app, node)) renderUnlockPixi(app, TECH_TREE, graphEl);
        return;
      }
      if (canUp) {
        if (upgradeTech(app, node)) renderUnlockPixi(app, TECH_TREE, graphEl);
      }
    });

    techApp.stage.addChild(card);

    const nameT = new PIXI.Text(node.name, { fill:'#eee', fontSize:22, fontWeight:'600' });
    nameT.x = p.x - nameT.width/2;
    nameT.y = p.y - cardH/2 + 12;
    techApp.stage.addChild(nameT);

    const statusT = new PIXI.Text(
      unlocked
        ? (maxLv ? `Lv.${lv}/${maxLv}` + (lv < maxLv ? (canUp ? ' · 可升级' : '') : '') : '已解锁')
        : (eligible[node.key] ? '可解锁' : '未解锁'),
      { fill:'#ccc', fontSize:16 }
    );
    statusT.x = p.x - statusT.width/2;
    statusT.y = p.y - cardH/2 + 60;
    techApp.stage.addChild(statusT);

    const reqStr = Object.entries(node.requires||{}).map(([k,v])=>`${k}×${v}`).join(' · ');
    const reqT = new PIXI.Text(reqStr, { fill:'#ccc', fontSize:16 });
    reqT.x = p.x - reqT.width/2;
    reqT.y = p.y - cardH/2 + 100;
    techApp.stage.addChild(reqT);
  }
}
