// js/unlock/unlock-pixi.js

import { buildTree, layoutTree } from "./tech-layout.js";

let techApp = null;

export function renderUnlockPixi(app, TECH_TREE, graphEl) {
  const unlockMgr = app.unlockManager;

  // 构建树结构与 map
  const { roots, map } = buildTree(TECH_TREE);

  const cardW = 140;
  const cardH = 110;

  // 计算坐标
  layoutTree(roots, cardW, cardH, 90, 10);

  // 图大小
  const graphW = 2110;
  const allNodes = Object.values(map);
  const maxY = Math.max(...allNodes.map((n) => n.y));
  const graphH = maxY + cardH + 200;

  // 初始化 Pixi
  if (!techApp) {
    techApp = new PIXI.Application({
      width: graphW,
      height: graphH,
      backgroundColor: 0x6a8698,
      resolution: window.devicePixelRatio,
    });
    graphEl.innerHTML = "";
    graphEl.appendChild(techApp.view);
  } else {
    techApp.renderer.resize(graphW, graphH);
  }

  techApp.stage.removeChildren();

  // 画线条
  const g = new PIXI.Graphics();
  g.lineStyle(3, 0xe8d49f, 0.8);
  techApp.stage.addChild(g);

  Object.values(map).forEach((node) => {
    (node.deps || []).forEach((parentKey) => {
      const parent = map[parentKey];
      if (!parent) return;

      g.moveTo(parent.x, parent.y + cardH / 2);
      g.lineTo(node.x, node.y - cardH / 2);
    });
  });

  function handleNodeClick(node, unlockMgr, app, TECH_TREE, graphEl) {
    const key = node.key;

    // 优先：未解锁 → 尝试解锁
    if (!unlockMgr.isUnlocked(key)) {
      const ok = unlockMgr.unlock(key);
      if (ok) {
        renderUnlockPixi(app, TECH_TREE, graphEl);
        return;
      }
    }

    // 已解锁 → 尝试升级
    if (unlockMgr.canUpgrade(key)) {
      const ok = unlockMgr.upgrade(key);
      if (ok) {
        renderUnlockPixi(app, TECH_TREE, graphEl);
        return;
      }
    }

    // 都不能 → 给个反馈（可选）
    console.log(`❌ 无法升级 ${node.name}`);
  }

  // 画节点
  Object.values(map).forEach((node) => {
    const unlocked = unlockMgr.isUnlocked(node.key);

    // 卡片
    const card = new PIXI.Graphics();
    card.lineStyle(4, unlocked ? 0xe8d49f : 0x666666);
    card.beginFill(0x1a1a1a);
    card.drawRoundedRect(
      node.x - cardW / 2,
      node.y - cardH / 2,
      cardW,
      cardH,
      10
    );
    card.endFill();

    // 绑定事件
    card.interactive = true;
    card.buttonMode = true;
    card.on("pointertap", () => handleNodeClick(node, unlockMgr, app, TECH_TREE, graphEl));
    techApp.stage.addChild(card);

    // 图标
    if (node.icon) {
      const sprite = PIXI.Sprite.from(node.icon);
      sprite.width = 48;
      sprite.height = 48;
      sprite.x = node.x - 24;
      sprite.y = node.y - cardH / 2 + 10;
      techApp.stage.addChild(sprite);
    }

    // 名字
    const t = new PIXI.Text(node.name, {
      fill: "#fff",
      fontSize: 20,
    });
    t.x = node.x - t.width / 2;
    t.y = node.y - 20;
    techApp.stage.addChild(t);
  });
}
