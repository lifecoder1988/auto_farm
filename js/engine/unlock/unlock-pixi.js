// js/unlock/unlock-pixi.js

import { buildTree, layoutTree } from "./tech-layout.js";

let techApp = null;

export function renderUnlockPixi(app, TECH_TREE, graphEl) {
  const unlockMgr = app.unlockManager;

  // 构建树结构
  const { roots, map } = buildTree(TECH_TREE);

  const cardW = 140;
  const cardH = 110;

  // 计算坐标
  layoutTree(roots, cardW, cardH, 90, 10);

  // 图大小
  const graphW = 2110;
  const maxY = Math.max(...Object.values(map).map((n) => n.y));
  const graphH = maxY + cardH + 200;

  // 初始化 Pixi，只做一次
  if (!techApp) {
    techApp = new PIXI.Application({
      width: graphW,
      height: graphH,
      backgroundColor: 0x1e1e1e,
      resolution: window.devicePixelRatio,
    });

    techApp.stage.sortableChildren = true;

    // --- 创建图层 ---
    techApp.graphLayer = new PIXI.Container();
    techApp.graphLayer.zIndex = 1;
    techApp.stage.addChild(techApp.graphLayer);

    techApp.uiLayer = new PIXI.Container();
    techApp.uiLayer.zIndex = 9999;
    techApp.stage.addChild(techApp.uiLayer);

    graphEl.innerHTML = "";
    graphEl.appendChild(techApp.view);
  } else {
    techApp.renderer.resize(graphW, graphH);
  }

  // === 清空图层 ===
  techApp.graphLayer.removeChildren();
  techApp.uiLayer.removeChildren();

  // === Tooltip（浮层） ===
  const tooltip = new PIXI.Container();
  tooltip.visible = false;

  const tooltipBg = new PIXI.Graphics();
  tooltip.addChild(tooltipBg);

  const tooltipText = new PIXI.Text("", {
    fontSize: 24,
    fill: "#fff",
    wordWrap: true,
    wordWrapWidth: 380,
    breakWords: true,
  });
  tooltip.addChild(tooltipText);

  // 放到 uiLayer
  techApp.uiLayer.addChild(tooltip);

  function updateTooltip(node, unlockMgr) {
    const curLv = unlockMgr.isUnlocked(node.key)
      ? unlockMgr.getLevel(node.key)
      : -1;

    const maxLv = unlockMgr.getMaxLevel(node);

    const curLevelObj = node.levels[curLv] || null;
    const nextLevelObj = node.levels[curLv + 1] || null;

    const curAbility = curLevelObj?.ability || null;
    const nextAbility = nextLevelObj?.ability || null;
    const requires = nextLevelObj?.requires || null;

    let lines = [];

    // --- 描述 ---
    if (node.desc) {
      lines.push(`【功能介绍】`);
      lines.push("");
      lines.push("　　" + node.desc);
      lines.push("");
    }

    // --- 当前等级 ---
    lines.push(`【当前等级】${curLv >= 0 ? curLv+1 : "未解锁"}`);

    // --- 当前效果 ---
    if (curAbility && curAbility.length > 0) {
      lines.push("【当前效果】");
      lines.push("");
      curAbility.forEach((a) => {
        lines.push(`  • ${a.name}：${a.value}`);
      });
    }

    // --- 升级材料 ---
    if (requires) {
      lines.push("");
      lines.push("【升级需要】");
      lines.push("");
      Object.entries(requires).forEach(([item, qty]) => {
        lines.push(`  • ${item}: ${qty}`);
      });
    }

    // --- 升级后效果 ---
    if (nextAbility && nextAbility.length > 0) {
      lines.push("");
      lines.push("【升级后效果】");
      lines.push("");
      nextAbility.forEach((a) => {
        lines.push(`  • ${a.name}：${(a.value * 100).toFixed(0) + "%"}`);
      });
    }

    // --- 已满级 ---
    if (!nextLevelObj) {
      lines.push("");
      lines.push("已达最高等级");
    }

    tooltipText.text = lines.join("\n");

    const pad = 12;
    tooltipBg.clear();
    tooltipBg.beginFill(0x000000, 0.88);
    tooltipBg.lineStyle(2, 0xe8d49f);
    tooltipBg.drawRoundedRect(
      -pad,
      -pad,
      tooltipText.width + pad * 2,
      tooltipText.height + pad * 2,
      8
    );
    tooltipBg.endFill();

    tooltip.visible = true;
  }

  function handleNodeClick(node) {
    const key = node.key;

    if (!unlockMgr.isUnlocked(key)) {
      if (unlockMgr.unlock(key)) {
        renderUnlockPixi(app, TECH_TREE, graphEl);
        return;
      }
    }

    if (unlockMgr.canUpgrade(key)) {
      if (unlockMgr.upgrade(key)) {
        renderUnlockPixi(app, TECH_TREE, graphEl);
        return;
      }
    }

    console.log(`❌ 无法升级 ${node.name}`);
  }

  // 画线条
  const g = new PIXI.Graphics();
  g.lineStyle(3, 0xe8d49f, 0.8);
  techApp.graphLayer.addChild(g);

  Object.values(map).forEach((node) => {
    (node.deps || []).forEach((parentKey) => {
      const parent = map[parentKey];
      if (!parent) return;

      g.moveTo(parent.x, parent.y + cardH / 2);
      g.lineTo(node.x, node.y - cardH / 2);
    });
  });

  // === 画节点 ===
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

    // 事件：点击
    card.interactive = true;
    card.buttonMode = true;
    card.on("pointertap", () => handleNodeClick(node));

    // 显示浮层
    card.on("pointerover", (ev) => {
      updateTooltip(node, unlockMgr);
      const pos = ev.data.getLocalPosition(techApp.stage);
      tooltip.x = pos.x + 20;
      tooltip.y = pos.y + 20;
    });

    card.on("pointermove", (ev) => {
      const pos = ev.data.getLocalPosition(techApp.stage);
      tooltip.x = pos.x + 20;
      tooltip.y = pos.y + 20;
    });

    card.on("pointerout", () => {
      tooltip.visible = false;
    });

    techApp.graphLayer.addChild(card);

    // 图标
    if (node.icon) {
      const sprite = PIXI.Sprite.from(node.icon);
      sprite.width = 48;
      sprite.height = 48;
      sprite.x = node.x - 24;
      sprite.y = node.y - cardH / 2 + 10;
      techApp.graphLayer.addChild(sprite);
    }

    // 名字
    const t = new PIXI.Text(node.name, {
      fill: "#fff",
      fontSize: 20,
    });
    t.x = node.x - t.width / 2;
    t.y = node.y - 20;
    techApp.graphLayer.addChild(t);

    // 等级显示（UI 级别：未解锁=0，已解锁=真实等级+1）
    const realLv = unlockMgr.getLevel(node.key);
    const maxLv = unlockMgr.getMaxLevel(node) + 1;
    const uiLv = unlocked ? realLv + 1 : 0;

    if (maxLv > 1) {
      const lvText = new PIXI.Text(`(${uiLv}/${maxLv})`, {
        fill: unlocked ? "#e8d49f" : "#888",
        fontSize: 16,
      });
      lvText.x = node.x - lvText.width / 2;
      lvText.y = node.y + 10;
      techApp.graphLayer.addChild(lvText);
    }
  });
}
