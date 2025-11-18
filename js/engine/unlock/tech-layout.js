// js/unlock/tech-layout.js

/**
 * 将 TECH_TREE 转成一棵（或多棵）依赖树
 * 输出：{ roots, map }
 */
export function buildTree(TECH_TREE) {
  const map = {};

  // clone 并添加 children 数组
  TECH_TREE.forEach(n => {
    map[n.key] = { ...n, children: [] };
  });

  // 建立父→子关系（dep 是父）
  TECH_TREE.forEach(n => {
    (n.deps || []).forEach(d => {
      if (map[d]) {
        map[d].children.push(map[n.key]);
      }
    });
  });

  // 找 root：没有任何节点依赖它，就是根节点
  const depended = new Set();
  TECH_TREE.forEach(n => (n.deps || []).forEach(d => depended.add(n.key)));

  const roots = TECH_TREE
    .filter(n => !depended.has(n.key))
    .map(n => map[n.key]);

  return { roots, map };
}


/**
 * Tidy-tree 布局算法：计算节点 x,y
 */
export function layoutTree(
  roots,
  cardW,
  cardH,
  levelGap = 160,
  siblingGap = 60  // ⭐水平间距（唯一可调参数）
) {

  // 第一遍：计算每个节点的子树宽度
  function dfs(node, depth) {
    node.depth = depth;

    if (node.children.length === 0) {
      node.width = cardW;
      return cardW;
    }

    let total = 0;

    node.children.forEach((c) => {
      total += dfs(c, depth + 1) + siblingGap;   // ⭐兄弟节点间距
    });

    total -= siblingGap; // 最后一个节点不加间距

    node.width = Math.max(cardW, total);
    return node.width;
  }

  roots.forEach((r) => dfs(r, 0));

  let maxX = 0;
  // 第二遍：根据 width 放置 x,y 坐标
  function place(node, left) {
    const x = left + node.width / 2;

    maxX = Math.max(maxX, x);

    node.x = x;
    node.y = node.depth * (cardH + levelGap) + 80;

    let offset = left;
    node.children.forEach((c) => {
      place(c, offset);
      offset += c.width + siblingGap;  // ⭐兄弟间距
    });
  }

  // 因为只有一个 root → 这里不需要 rootGap
  place(roots[0], 40);
  console.log("Tree Width =", maxX);
}

