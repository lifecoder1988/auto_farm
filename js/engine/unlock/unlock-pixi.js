// js/unlock/unlock-pixi.js

let techApp = null;

export function renderUnlockPixi(app, TECH_TREE, graphEl) {

  const unlockMgr = app.unlockManager;
  const { roots, map } = buildTree(TECH_TREE);

  const cardW = 140, cardH = 110;

  layoutTree(roots, cardW, cardH, 160);

  // 计算整体高度
  const maxY = Math.max(...TECH_TREE.map(n => n.y));
  const graphW = graphEl.clientWidth || 800;
  const graphH = maxY + cardH + 200;

  if (!techApp) {
    techApp = new PIXI.Application({
      width: graphW,
      height: graphH,
      backgroundColor: 0x6a8698,  // 类似图中背景
      resolution: window.devicePixelRatio,
    });
    graphEl.innerHTML = '';
    graphEl.appendChild(techApp.view);
  } else {
    techApp.renderer.resize(graphW, graphH);
  }

  techApp.stage.removeChildren();

  const g = new PIXI.Graphics();
  g.lineStyle(3, 0xe8d49f, 0.8);
  techApp.stage.addChild(g);

  // 画线（父->子）
  TECH_TREE.forEach(n => {
    const p2 = n;
    (n.deps || []).forEach(d => {
      const p1 = map[d];
      if (!p1) return;

      g.moveTo(p1.x, p1.y + cardH/2);
      g.lineTo(p2.x, p2.y - cardH/2);
    });
  });

  // 画节点
  TECH_TREE.forEach(node => {
    const unlocked = unlockMgr.isUnlocked(node.key);

    const card = new PIXI.Graphics();
    card.lineStyle(4, unlocked ? 0xe8d49f : 0x666666);
    card.beginFill(0x1a1a1a);
    card.drawRoundedRect(node.x - cardW/2, node.y - cardH/2, cardW, cardH, 10);
    card.endFill();
    techApp.stage.addChild(card);

    // 图标
    if (node.icon) {
      const sprite = PIXI.Sprite.from(node.icon);
      sprite.width = 48;
      sprite.height = 48;
      sprite.x = node.x - 24;
      sprite.y = node.y - cardH/2 + 10;
      techApp.stage.addChild(sprite);
    }

    // 文本
    const t = new PIXI.Text(node.name, { fill: '#fff', fontSize: 20 });
    t.x = node.x - t.width/2;
    t.y = node.y - 20;
    techApp.stage.addChild(t);
  });
}
