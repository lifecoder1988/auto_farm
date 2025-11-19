// js/data/tech-tree.js

export const TECH_TREE = [
  /* -------------------------------------------------------
   * Auto Unlock
   * -----------------------------------------------------*/
  {
    key: "auto_unlock",
    name: "自动解锁",
    tier:8,
    deps: ["costs"],
    levels: [
      { level: 0, requires: { pumpkin: 5000 } }
    ]
  },

  /* -------------------------------------------------------
   * Cactus
   * -----------------------------------------------------*/
  {
    key: "cactus",
    name: "仙人掌",
    tier: 6,
    deps: ["pumpkins"],
    levels: [
      { level: 0, requires: { pumpkin: 5000 } },
      { level: 1, requires: { pumpkin: 20000 } },
      { level: 2, requires: { pumpkin: 120000 } },
      { level: 3, requires: { pumpkin: 720000 } },
      { level: 4, requires: { pumpkin: 4320000 } },
      { level: 5, requires: { pumpkin: 25900000 } },
    ]
  },

  /* -------------------------------------------------------
   * Carrots
   * -----------------------------------------------------*/
  {
    key: "carrots",
    name: "胡萝卜科技",
    tier: 3,
    deps: ["grass"],
    levels: [
      { level: 0, requires: { wood: 50 } },
      { level: 1, requires: { wood: 250 } },
      { level: 2, requires: { wood: 1250 } },
      { level: 3, requires: { wood: 6250 } },
      { level: 4, requires: { wood: 31200 } },
      { level: 5, requires: { wood: 156000 } },
      { level: 6, requires: { wood: 781000 } },
      { level: 7, requires: { wood: 3910000 } },
      { level: 8, requires: { wood: 19500000 } },
      { level: 9, requires: { wood: 97700000 } },
    ]
  },

  /* -------------------------------------------------------
   * Costs
   * -----------------------------------------------------*/
  {
    key: "costs",
    name: "成本",
    tier: 7,
    deps: ["dictionaries"],
    levels: [
      { level: 0, requires: { pumpkin: 2500 } },
    ]
  },

  /* -------------------------------------------------------
   * Debug
   * -----------------------------------------------------*/
  {
    key: "debug",
    name: "调试工具",
    tier: 3,
    deps: ["plant"],
    levels: [
      { level: 0, requires: { hay: 50, wood: 50 } },
    ]
  },

  {
    key: "debug_2",
    name: "调试工具 II",
    tier: 4,
    deps: ["debug"],
    levels: [
      { level: 0, requires: { gold: 500 } }
    ]
  },

  /* -------------------------------------------------------
   * Dictionaries
   * -----------------------------------------------------*/
  {
    key: "dictionaries",
    name: "字典",
    tier: 6,
    deps: ["lists"],
    levels: [
      { level: 0, requires: { pumpkin: 2500 } }
    ]
  },

  /* -------------------------------------------------------
   * Snake
   * -----------------------------------------------------*/
  {
    key: "snake",
    name: "蛇",
    tier: 7,
    deps: ["cactus"],
    levels: [
      { level: 0, requires: { cactus: 2000 } },
      { level: 1, requires: { cactus: 12000 } },
      { level: 2, requires: { cactus: 72000 } },
      { level: 3, requires: { cactus: 432000 } },
      { level: 4, requires: { cactus: 2590000 } },
      { level: 5, requires: { cactus: 15600000 } },
    ]
  },

  /* -------------------------------------------------------
   * Expand
   * -----------------------------------------------------*/
  {
    key: "expand",
    name: "扩建",
    tier: 2,
    deps: ["speed"],
    levels: [
      { level: 0, requires: { hay: 30 } },
      { level: 1, requires: { wood: 20 } },
      { level: 2, requires: { wood: 30, carrot: 20 } },
      { level: 3, requires: { wood: 100, carrot: 50 } },
      { level: 4, requires: { pumpkin: 1000 } },
      { level: 5, requires: { pumpkin: 8000 } },
      { level: 6, requires: { pumpkin: 64000 } },
      { level: 7, requires: { pumpkin: 512000 } },
      { level: 8, requires: { pumpkin: 4100000 } },
    ]
  },

  /* -------------------------------------------------------
   * Fertilizer
   * -----------------------------------------------------*/
  {
    key: "fertilizer",
    name: "肥料",
    tier: 5,
    deps: ["watering"],
    levels: [
      { level: 0, requires: { wood: 500 } },
      { level: 1, requires: { wood: 1500 } },
      { level: 2, requires: { wood: 9000 } },
      { level: 3, requires: { wood: 54000 } },
    ]
  },

  /* -------------------------------------------------------
   * Functions
   * -----------------------------------------------------*/
  {
    key: "functions",
    name: "函数",
    tier: 5,
    deps: ["variables"],
    levels: [
      { level: 0, requires: { carrot: 40 } }
    ]
  },

  /* -------------------------------------------------------
   * Grass
   * -----------------------------------------------------*/
  {
    key: "grass",
    name: "草",
    tier: 1,
    deps: ["loops"],
    levels: [
      { level: 0, requires: { hay: 100 } },
      { level: 1, requires: { hay: 300 } },
      { level: 2, requires: { wood: 500 } },
      { level: 3, requires: { wood: 2500 } },
      { level: 4, requires: { wood: 12500 } },
      { level: 5, requires: { wood: 62500 } },
      { level: 6, requires: { wood: 312000 } },
      { level: 7, requires: { wood: 1560000 } },
      { level: 8, requires: { wood: 7810000 } },
      { level: 9, requires: { wood: 39100000 } },
    ]
  },

  /* -------------------------------------------------------
   * Hats
   * -----------------------------------------------------*/
  {
    key: "dino",
    name: "小恐龙",
    tier: 1,
    deps: ["loops"],
    levels: [
      { level: 0, requires: { hay: 50 } },
    ]
  },

  /* -------------------------------------------------------
   * Import
   * -----------------------------------------------------*/
  {
    key: "import",
    name: "导入",
    tier: 6,
    deps: ["functions"],
    levels: [
      { level: 0, requires: { carrot: 80 } }
    ]
  },

  /* -------------------------------------------------------
   * Leaderboard
   * -----------------------------------------------------*/
  {
    key: "leaderboard",
    name: "排行榜",
    tier: 6,
    deps: ["simulation"],
    levels: [
      { level: 0, requires: { apple: 2000000, gold: 1000000 } }
    ]
  },

  /* -------------------------------------------------------
   * Lists
   * -----------------------------------------------------*/
  {
    key: "lists",
    name: "列表",
    tier: 5,
    deps: ["variables"],
    levels: [
      { level: 0, requires: { carrot: 500 } }
    ]
  },

  /* -------------------------------------------------------
   * Loops
   * -----------------------------------------------------*/
  {
    key: "loops",
    name: "循环",
    tier: 0,
    deps: [],
    levels: [
      { level: 0, requires: { hay: 5 } }
    ]
  },

  /* -------------------------------------------------------
   * Mazes
   * -----------------------------------------------------*/
  {
    key: "mazes",
    name: "迷宫",
    tier: 6,
    deps: ["fertilizer"],
    levels: [
      { level: 0, requires: { weird_substance: 1000 } },
      { level: 1, requires: { cactus: 12000 } },
      { level: 2, requires: { cactus: 72000 } },
      { level: 3, requires: { cactus: 432000 } },
      { level: 4, requires: { cactus: 2590000 } },
      { level: 5, requires: { cactus: 15600000 } },
    ]
  },

  /* -------------------------------------------------------
   * Megafarm
   * -----------------------------------------------------*/
  {
    key: "megafarm",
    name: "巨型农场",
    tier: 7,
    deps: ["mazes"],
    levels: [
      { level: 0, requires: { gold: 2000 } },
      { level: 1, requires: { gold: 8000 } },
      { level: 2, requires: { gold: 32000 } },
      { level: 3, requires: { gold: 128000 } },
      { level: 4, requires: { gold: 512000 } },
    ]
  },

  /* -------------------------------------------------------
   * Operators
   * -----------------------------------------------------*/
  {
    key: "operators",
    name: "运算符",
    tier: 3,
    deps: ["plant"],
    levels: [
      { level: 0, requires: { hay: 150, wood: 10 } }
    ]
  },

  /* -------------------------------------------------------
   * Plant
   * -----------------------------------------------------*/
  {
    key: "plant",
    name: "种植",
    tier: 2,
    deps: ["speed"],
    levels: [
      { level: 0, requires: { hay: 50 } },
    ]
  },

  /* -------------------------------------------------------
   * Polycul ture
   * -----------------------------------------------------*/
  {
    key: "polyculture",
    name: "多种栽培",
    tier: 6,
    deps: ["pumpkins"],
    levels: [
      { level: 0, requires: { pumpkin: 3000 } },
      { level: 1, requires: { apple: 10000 } },
      { level: 2, requires: { apple: 50000 } },
      { level: 3, requires: { apple: 250000 } },
      { level: 4, requires: { apple: 1250000 } },
    ]
  },

  /* -------------------------------------------------------
   * Pumpkins
   * -----------------------------------------------------*/
  {
    key: "pumpkins",
    name: "南瓜科技",
    tier: 5,
    deps: ["trees"],
    levels: [
      { level: 0, requires: { wood: 500, carrot: 200 } },
      { level: 1, requires: { carrot: 1000 } },
      { level: 2, requires: { carrot: 4000 } },
      { level: 3, requires: { carrot: 16000 } },
      { level: 4, requires: { carrot: 64000 } },
      { level: 5, requires: { carrot: 256000 } },
      { level: 6, requires: { carrot: 1020000 } },
      { level: 7, requires: { carrot: 4100000 } },
      { level: 8, requires: { carrot: 16400000 } },
      { level: 9, requires: { carrot: 65500000 } },
    ]
  },

  /* -------------------------------------------------------
   * Senses
   * -----------------------------------------------------*/
  {
    key: "senses",
    name: "感知",
    tier: 4,
    deps: ["debug"],
    levels: [
      { level: 0, requires: { hay: 100 } }
    ]
  },

  /* -------------------------------------------------------
   * Simulation
   * -----------------------------------------------------*/
  {
    key: "simulation",
    name: "模拟",
    tier: 5,
    deps: ["timing"],
    levels: [
      { level: 0, requires: { gold: 5000 } }
    ]
  },

  /* -------------------------------------------------------
   * Speed
   * -----------------------------------------------------*/
  {
    key: "speed",
    name: "速度",
    tier: 1,
    deps: ["loops"],
    levels: [
      { level: 0, requires: { hay: 20 } },
      { level: 1, requires: { wood: 20 } },
      { level: 2, requires: { wood: 50, carrot: 50 } },
      { level: 3, requires: { carrot: 500 } },
      { level: 4, requires: { carrot: 1000 } },
    ]
  },

  /* -------------------------------------------------------
   * Sunflowers
   * -----------------------------------------------------*/
  {
    key: "sunflowers",
    name: "向日葵",
    tier: 5,
    deps: ["watering"],
    levels: [
      { level: 0, requires: { carrot: 500 } }
    ]
  },

  /* -------------------------------------------------------
   * The Farmer's Remains
   * -----------------------------------------------------*/
  {
    key: "remains",
    name: "农夫的遗骨",
    tier: 8,
    deps: ["snake"],
    levels: [
      { level: 0, requires: { apple: 100000000 } }
    ]
  },

  /* -------------------------------------------------------
   * Timing
   * -----------------------------------------------------*/
  {
    key: "timing",
    name: "计时",
    tier: 4,
    deps: ["debug"],
    levels: [
      { level: 0, requires: { pumpkin: 1000 } }
    ]
  },

  /* -------------------------------------------------------
   * Top Hat
   * -----------------------------------------------------*/
  {
    key: "top_hat",
    name: "高礼帽",
    tier: 7,
    deps: ["mazes"],
    levels: [
      { level: 0, requires: {
        hay: 1000000000,
        wood: 10000000000,
        carrot: 1000000000,
        cactus: 1000000000,
        gold: 100000000,
      } }
    ]
  },

  /* -------------------------------------------------------
   * Trees
   * -----------------------------------------------------*/
  {
    key: "trees",
    name: "树",
    tier: 4,
    deps: ["carrots"],
    levels: [
      { level: 0, requires: { wood: 50, carrot: 70 } },
      { level: 1, requires: { hay: 300 } },
      { level: 2, requires: { hay: 1200 } },
      { level: 3, requires: { hay: 4800 } },
      { level: 4, requires: { hay: 19200 } },
      { level: 5, requires: { hay: 76800 } },
      { level: 6, requires: { hay: 307000 } },
      { level: 7, requires: { hay: 1230000 } },
      { level: 8, requires: { hay: 4920000 } },
      { level: 9, requires: { hay: 19700000 } },
    ]
  },

  /* -------------------------------------------------------
   * Utilities
   * -----------------------------------------------------*/
  {
    key: "utilities",
    name: "工具",
    tier: 6,
    deps: ["functions"],
    levels: [
      { level: 0, requires: { pumpkin: 1000 } },
    ]
  },

  /* -------------------------------------------------------
   * Variables
   * -----------------------------------------------------*/
  {
    key: "variables",
    name: "变量",
    tier: 4,
    deps: ["operators"],
    levels: [
      { level: 0, requires: { carrot: 35 } }
    ]
  },

  /* -------------------------------------------------------
   * Watering
   * -----------------------------------------------------*/
  {
    key: "watering",
    name: "浇水",
    tier: 4,
    deps: ["carrots"],
    levels: [
      { level: 0, requires: { wood: 50 } },
      { level: 1, requires: { wood: 200 } },
      { level: 2, requires: { wood: 800 } },
      { level: 3, requires: { wood: 3200 } },
      { level: 4, requires: { wood: 12800 } },
      { level: 5, requires: { wood: 51200 } },
      { level: 6, requires: { wood: 205000 } },
      { level: 7, requires: { wood: 819000 } },
      { level: 8, requires: { wood: 3280000 } },
    ]
  },
];
