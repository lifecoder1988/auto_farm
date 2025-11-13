// js/data/tech-tree.js

export const TECH_TREE = [
  // 第 1 层：基础科技，无依赖
  { key:'rice',   name:'稻谷',   tier:1, deps:[], requires: { peanut: 1 } },
  { key:'grass',  name:'草',     tier:1, deps:[], requires: { potato: 1 } },

  // 第 2 层：需要先解锁对应的基础科技
  { key:'trees',   name:'树木',   tier:2, deps:['grass'], requires: { potato: 2, peanut: 2 } },
  { key:'pumpkin', name:'南瓜',   tier:2, deps:['rice'],  requires: { pumpkin: 1 }, maxLevel: 5 },

  // 第 3 层：进一步解锁
  { key:'cactus',  name:'仙人掌', tier:3, deps:['pumpkin'], requires: { pumpkin: 2 } },
  { key:'carrot',  name:'胡萝卜', tier:3, deps:['rice','grass'], requires: { potato: 3, peanut: 1, pumpkin: 1 } },

  // 第 4 层：代码能力
  { key:'while',   name:'while 循环', tier:4, deps:['carrot'], requires: { } }
];
