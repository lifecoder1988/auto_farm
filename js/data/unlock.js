// js/data/tech-tree.js

export const TECH_TREE = [
  /* -------------------------------------------------------
   * Auto Unlock
   * -----------------------------------------------------*/
  {
    key: "auto_unlock",
    name: "autoUnlock()",
    tier: 8,
    deps: ["costs"],
    desc: "让科技树进入自动化时代。当资源满足条件时自动解锁科技，无需手动操作。",
    levels: [{ level: 0, requires: { pumpkin: 5000 } }],
  },

  /* -------------------------------------------------------
   * Cactus
   * -----------------------------------------------------*/
  {
    key: "cactus",
    name: "仙人掌",
    tier: 6,
    deps: ["pumpkins"],
    desc: "提高仙人掌的产能，使其成为高价值资源的主要来源。每升一级，使仙人掌产能成倍提升。",
    levels: [
      {
        level: 0,
        requires: { pumpkin: 5000 },
        ability: [{ name: "产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { pumpkin: 20000 },
        ability: [{ name: "产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { pumpkin: 120000 },
        ability: [{ name: "产量倍率", value: 4 }],
      },
      {
        level: 3,
        requires: { pumpkin: 720000 },
        ability: [{ name: "产量倍率", value: 8 }],
      },
      {
        level: 4,
        requires: { pumpkin: 4320000 },
        ability: [{ name: "产量倍率", value: 16 }],
      },
      {
        level: 5,
        requires: { pumpkin: 25900000 },
        ability: [{ name: "产量倍率", value: 32 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Carrots
   * -----------------------------------------------------*/
  {
    key: "carrots",
    name: "胡萝卜",
    tier: 3,
    deps: ["grass"],
    desc: "提高胡萝卜的产量，使其成为高价值资源的主要来源。每升一级，使胡萝卜产量成倍提升。",

    levels: [
      {
        level: 0,
        requires: { wood: 50 },
        ability: [{ name: "产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { wood: 250 },
        ability: [{ name: "产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { wood: 1250 },
        ability: [{ name: "产量倍率", value: 4 }],
      },
      {
        level: 3,
        requires: { wood: 6250 },
        ability: [{ name: "产量倍率", value: 8 }],
      },
      {
        level: 4,
        requires: { wood: 31200 },
        ability: [{ name: "产量倍率", value: 16 }],
      },
      {
        level: 5,
        requires: { wood: 156000 },
        ability: [{ name: "产量倍率", value: 32 }],
      },
      {
        level: 6,
        requires: { wood: 781000 },
        ability: [{ name: "产量倍率", value: 64 }],
      },
      {
        level: 7,
        requires: { wood: 3910000 },
        ability: [{ name: "产量倍率", value: 128 }],
      },
      {
        level: 8,
        requires: { wood: 19500000 },
        ability: [{ name: "产量倍率", value: 256 }],
      },
      {
        level: 9,
        requires: { wood: 97700000 },
        ability: [{ name: "产量倍率", value: 512 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Costs
   * -----------------------------------------------------*/
  {
    key: "costs",
    name: "getCost()",
    desc: "解锁 getCost() 函数，使你能够在代码中动态查询作物种植的资源花费，为自动化种植与资源规划提供必要支持。",

    tier: 7,
    deps: ["dictionaries"],
    levels: [{ level: 0, requires: { pumpkin: 2500 } }],
  },

  /* -------------------------------------------------------
   * Debug
   * -----------------------------------------------------*/
  {
    key: "debug",
    name: "console.log()",
    desc: "解锁 console.log() 函数，用于在控制台输出信息，是调试脚本与观察游戏状态的重要工具。",
    tier: 3,
    deps: ["plant"],
    levels: [{ level: 0, requires: { hay: 50, wood: 50 } }],
  },

  {
    key: "debug_2",
    name: "setSpeed",
    desc: "解锁 setSpeed() 函数，用于设置游戏运行速度，方便调试与游戏体验调整。",
    tier: 4,
    deps: ["debug"],
    levels: [{ level: 0, requires: { gold: 500 } }],
  },

  /* -------------------------------------------------------
   * Dictionaries
   * -----------------------------------------------------*/
  {
    key: "dictionaries",
    name: "{'a':1, 'b':2}",
    desc: "允许在代码中使用对象（dictionary），以存储和组织更复杂的数据结构，是构建高级自动化逻辑的重要基础能力。",

    tier: 6,
    deps: ["lists"],
    levels: [{ level: 0, requires: { pumpkin: 2500 } }],
  },

  /* -------------------------------------------------------
   * Snake
   * -----------------------------------------------------*/
  {
    key: "snake",
    name: "蛇",
    tier: 7,
    deps: ["cactus"],
    desc: "解锁贪吃蛇模型，使你能够操控蛇并收集苹果，为农场提供额外的资源来源。",
    levels: [
      {
        level: 0,
        requires: { cactus: 2000 },
        ability: [{ name: "苹果产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { cactus: 12000 },
        ability: [{ name: "苹果产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { cactus: 72000 },
        ability: [{ name: "苹果产量倍率", value: 4 }],
      },
      {
        level: 3,
        requires: { cactus: 432000 },
        ability: [{ name: "苹果产量倍率", value: 8 }],
      },
      {
        level: 4,
        requires: { cactus: 2590000 },
        ability: [{ name: "苹果产量倍率", value: 16 }],
      },
      {
        level: 5,
        requires: { cactus: 15600000 },
        ability: [{ name: "苹果产量倍率", value: 32 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Expand
   * -----------------------------------------------------*/
  {
    key: "expand",
    name: "扩建",
    desc: "解锁扩建功能，使你能够增加游戏世界的尺寸，为游戏提供更多的可种植区域。",
    tier: 2,
    deps: ["speed"],

    levels: [
      {
        level: 0,
        requires: { hay: 30 },
        ability: [
          { name: "世界尺寸", value: 4 }, // 4x4
        ],
      },
      {
        level: 1,
        requires: { wood: 20 },
        ability: [
          { name: "世界尺寸", value: 6 }, // 6x6
        ],
      },
      {
        level: 2,
        requires: { wood: 30, carrot: 20 },
        ability: [
          { name: "世界尺寸", value: 8 }, // 8x8
        ],
      },
      {
        level: 3,
        requires: { wood: 100, carrot: 50 },
        ability: [
          { name: "世界尺寸", value: 12 }, // 12x12
        ],
      },
      {
        level: 4,
        requires: { pumpkin: 1000 },
        ability: [
          { name: "世界尺寸", value: 16 }, // 16x16
        ],
      },
      {
        level: 5,
        requires: { pumpkin: 8000 },
        ability: [
          { name: "世界尺寸", value: 20 }, // 20x20
        ],
      },
      {
        level: 6,
        requires: { pumpkin: 64000 },
        ability: [
          { name: "世界尺寸", value: 24 }, // 24x24
        ],
      },
      {
        level: 7,
        requires: { pumpkin: 512000 },
        ability: [
          { name: "世界尺寸", value: 28 }, // 28x28
        ],
      },
      {
        level: 8,
        requires: { pumpkin: 4100000 },
        ability: [
          { name: "世界尺寸", value: 32 }, // 32x32 最终
        ],
      },
    ],
  },

  /* -------------------------------------------------------
   * Fertilizer
   * -----------------------------------------------------*/
  {
    key: "fertilizer",
    name: "肥料",
    tier: 5,
    desc: "解锁肥料功能，使你能够为植物添加肥料，提高其生长速度和产量。",
    deps: ["watering"],

    levels: [
      {
        level: 0,
        requires: { wood: 500 },
        ability: [
          { name: "生长速度加成", value: 0.2 }, // +20%
        ],
      },
      {
        level: 1,
        requires: { wood: 1500 },
        ability: [
          { name: "生长速度加成", value: 0.5 }, // +50%
        ],
      },
      {
        level: 2,
        requires: { wood: 9000 },
        ability: [
          { name: "生长速度加成", value: 1.2 }, // +120%
        ],
      },
      {
        level: 3,
        requires: { wood: 54000 },
        ability: [
          { name: "生长速度加成", value: 2.5 }, // +250%
        ],
      },
    ],
  },

  /* -------------------------------------------------------
   * Functions
   * -----------------------------------------------------*/
  {
    key: "functions",
    name: "function() {}",
    desc: "解锁函数功能，使你能够定义和调用自定义函数，为游戏添加更多的交互性和灵活性。",
    tier: 5,
    deps: ["variables"],
    levels: [{ level: 0, requires: { carrot: 40 } }],
  },

  /* -------------------------------------------------------
   * Grass
   * -----------------------------------------------------*/
  {
    key: "grass",
    name: "草",
    desc: "解锁草功能，使你能够在游戏世界中种植和生长草，为农场提供额外的资源来源。",
    tier: 1,
    deps: ["loops"],

    levels: [
      {
        level: 0,
        requires: { hay: 100 },
        ability: [{ name: "产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { hay: 300 },
        ability: [{ name: "产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { wood: 500 },
        ability: [{ name: "产量倍率", value: 4 }],
      },
      {
        level: 3,
        requires: { wood: 2500 },
        ability: [{ name: "产量倍率", value: 8 }],
      },
      {
        level: 4,
        requires: { wood: 12500 },
        ability: [{ name: "产量倍率", value: 16 }],
      },
      {
        level: 5,
        requires: { wood: 62500 },
        ability: [{ name: "产量倍率", value: 32 }],
      },
      {
        level: 6,
        requires: { wood: 312000 },
        ability: [{ name: "产量倍率", value: 64 }],
      },
      {
        level: 7,
        requires: { wood: 1560000 },
        ability: [{ name: "产量倍率", value: 128 }],
      },
      {
        level: 8,
        requires: { wood: 7810000 },
        ability: [{ name: "产量倍率", value: 256 }],
      },
      {
        level: 9,
        requires: { wood: 39100000 },
        ability: [{ name: "产量倍率", value: 512 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Dino
   * -----------------------------------------------------*/
  {
    key: "dino",
    name: "小恐龙",
    desc: "解锁小恐龙皮肤",
    tier: 1,
    deps: ["loops"],
    levels: [{ level: 0, requires: { hay: 50 } }],
  },

  /* -------------------------------------------------------
   * Import
   * -----------------------------------------------------*/
  {
    key: "import",
    name: "导入",
    desc: "解锁导入功能，使你能够从外部文件导入数据，为游戏添加更多的交互性和灵活性。",
    tier: 6,
    deps: ["functions"],
    levels: [{ level: 0, requires: { carrot: 80 } }],
  },

  /* -------------------------------------------------------
   * Leaderboard
   * -----------------------------------------------------*/
  /*{
    key: "leaderboard",
    name: "排行榜",
    tier: 6,
    deps: ["simulation"],
    levels: [
      { level: 0, requires: { apple: 2000000, gold: 1000000 } }
    ]
  },*/

  /* -------------------------------------------------------
   * Lists
   * -----------------------------------------------------*/
  {
    key: "lists",
    name: "[1,2,3]",
    desc: "解锁列表功能，使你能够创建和操作列表，为游戏添加更多的交互性和灵活性。",
    tier: 5,
    deps: ["variables"],
    levels: [{ level: 0, requires: { carrot: 500 } }],
  },

  /* -------------------------------------------------------
   * Loops
   * -----------------------------------------------------*/
  {
    key: "loops",
    name: "while",
    desc: "解锁循环功能，使你能够重复执行代码块，为游戏添加更多的交互性和灵活性。",
    tier: 0,
    deps: [],
    levels: [{ level: 0, requires: { hay: 5 } }],
  },

  /* -------------------------------------------------------
   * Mazes
   * -----------------------------------------------------*/
  {
    key: "mazes",
    name: "迷宫",
    tier: 6,
    deps: ["fertilizer"],
    desc: "解锁迷宫系统，可在迷宫中探索并收集金币，为高级科技提供重要资源。",
    levels: [
      {
        level: 0,
        requires: { cactus: 300 },
        ability: [{ name: "金币产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { cactus: 12000 },
        ability: [{ name: "金币产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { cactus: 72000 },
        ability: [{ name: "金币产量倍率", value: 4 }],
      },
      {
        level: 3,
        requires: { cactus: 432000 },
        ability: [{ name: "金币产量倍率", value: 8 }],
      },
      {
        level: 4,
        requires: { cactus: 2590000 },
        ability: [{ name: "金币产量倍率", value: 16 }],
      },
      {
        level: 5,
        requires: { cactus: 15600000 },
        ability: [{ name: "金币产量倍率", value: 32 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Megafarm
   * -----------------------------------------------------*/
  {
    key: "megafarm",
    name: "巨型农场",
    tier: 7,
    deps: ["mazes"],
    desc: "解锁巨型农场系统，显著提升自动化任务的并发能力，让农场整体效率得到巨幅提升。",
    levels: [
      {
        level: 0,
        requires: { gold: 2000 },
        ability: [{ name: "spawn并发数量", value: 4 }],
      },
      {
        level: 1,
        requires: { gold: 8000 },
        ability: [{ name: "spawn并发数量", value: 8 }],
      },
      {
        level: 2,
        requires: { gold: 32000 },
        ability: [{ name: "spawn并发数量", value: 12 }],
      },
      {
        level: 3,
        requires: { gold: 128000 },
        ability: [{ name: "spawn并发数量", value: 20 }],
      },
      {
        level: 4,
        requires: { gold: 512000 },
        ability: [
          { name: "spawn并发数量", value: 32 }, // 上限
        ],
      },
    ],
  },

  /* -------------------------------------------------------
   * Operators
   * -----------------------------------------------------*/
  {
    key: "operators",
    name: "1 + 1",
    desc: "解锁运算符功能，使你能够进行基本的数学运算，为游戏添加更多的交互性和灵活性。",
    tier: 3,
    deps: ["plant"],
    levels: [{ level: 0, requires: { hay: 150, wood: 10 } }],
  },

  /* -------------------------------------------------------
   * Plant
   * -----------------------------------------------------*/
  {
    key: "plant",
    name: "plant()",
    desc: "解锁种植功能，使你能够在游戏中种植作物，为游戏添加更多的互动性和趣味性。",
    tier: 2,
    deps: ["speed"],
    levels: [{ level: 0, requires: { hay: 50 } }],
  },

  /* -------------------------------------------------------
   * Polycul ture
   * -----------------------------------------------------*/
  {
    key: "polyculture",
    name: "多种栽培",
    tier: 6,
    deps: ["pumpkins"],
    desc: "提升多种作物同时栽培时的整体产量，作物种类越丰富，农场的总产能就越高。",
    levels: [
      {
        level: 0,
        requires: { pumpkin: 3000 },
        ability: [{ name: "产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { apple: 10000 },
        ability: [{ name: "产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { apple: 50000 },
        ability: [{ name: "产量倍率", value: 3 }],
      },
      {
        level: 3,
        requires: { apple: 250000 },
        ability: [{ name: "产量倍率", value: 4 }],
      },
      {
        level: 4,
        requires: { apple: 1250000 },
        ability: [{ name: "产量倍率", value: 5 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Pumpkins
   * -----------------------------------------------------*/
  {
    key: "pumpkins",
    name: "南瓜",
    desc: "解锁南瓜栽培功能，使你能够在游戏中种植和管理南瓜，为游戏添加更多的互动性和趣味性。",
    tier: 5,
    deps: ["trees"],

    levels: [
      {
        level: 0,
        requires: { wood: 500, carrot: 200 },
        ability: [{ name: "产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { carrot: 1000 },
        ability: [{ name: "产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { carrot: 4000 },
        ability: [{ name: "产量倍率", value: 4 }],
      },
      {
        level: 3,
        requires: { carrot: 16000 },
        ability: [{ name: "产量倍率", value: 8 }],
      },
      {
        level: 4,
        requires: { carrot: 64000 },
        ability: [{ name: "产量倍率", value: 16 }],
      },
      {
        level: 5,
        requires: { carrot: 256000 },
        ability: [{ name: "产量倍率", value: 32 }],
      },
      {
        level: 6,
        requires: { carrot: 1020000 },
        ability: [{ name: "产量倍率", value: 64 }],
      },
      {
        level: 7,
        requires: { carrot: 4100000 },
        ability: [{ name: "产量倍率", value: 128 }],
      },
      {
        level: 8,
        requires: { carrot: 16400000 },
        ability: [{ name: "产量倍率", value: 256 }],
      },
      {
        level: 9,
        requires: { carrot: 65500000 },
        ability: [{ name: "产量倍率", value: 512 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Senses
   * -----------------------------------------------------*/
  {
    key: "senses",
    name: "(x,y)",
    desc: "解锁传感器功能，使你能够在游戏中获取当前位置的信息，为游戏添加更多的互动性和趣味性。",
    tier: 4,
    deps: ["debug"],
    levels: [{ level: 0, requires: { hay: 100 } }],
  },

  /* -------------------------------------------------------
   * Simulation
   * -----------------------------------------------------*/
  /*{
    key: "simulation",
    name: "模拟",
    tier: 5,
    deps: ["timing"],
    levels: [
      { level: 0, requires: { gold: 5000 } }
    ]
  },*/

  /* -------------------------------------------------------
   * Speed
   * -----------------------------------------------------*/
  {
    key: "speed",
    name: "速度",
    desc: "提升游戏的行动速度，使你能够更快地完成任务。",
    tier: 1,
    deps: ["loops"],

    levels: [
      {
        level: 0,
        requires: { hay: 20 },
        ability: [{ name: "行动速度倍率", value: 1.0 }],
      },
      {
        level: 1,
        requires: { wood: 20 },
        ability: [{ name: "行动速度倍率", value: 1.3 }],
      },
      {
        level: 2,
        requires: { wood: 50, carrot: 50 },
        ability: [{ name: "行动速度倍率", value: 1.6 }],
      },
      {
        level: 3,
        requires: { carrot: 500 },
        ability: [{ name: "行动速度倍率", value: 2.0 }],
      },
      {
        level: 4,
        requires: { carrot: 1000 },
        ability: [{ name: "行动速度倍率", value: 2.5 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Sunflowers
   * -----------------------------------------------------*/
  {
    key: "sunflowers",
    name: "向日葵",
    tier: 5,
    desc: "解锁向日葵，可将其作为加速材料使用。系统会自动消耗向日葵,能显著提升植物的生长速度。",
    deps: ["watering"],
    levels: [{ level: 0, requires: { carrot: 500 } }],
  },

  /* -------------------------------------------------------
   * The Farmer's Remains
   * -----------------------------------------------------*/
  {
    key: "remains",
    name: "农夫的遗骨",
    tier: 8,
    deps: ["snake"],
    levels: [{ level: 0, requires: { apple: 100000000 } }],
  },

  /* -------------------------------------------------------
   * Timing
   * -----------------------------------------------------*/
  {
    key: "timing",
    name: "getTime()",
    tier: 4,
    desc:"还没想好怎么实现",
    deps: ["debug"],
    levels: [{ level: 0, requires: { pumpkin: 1000 } }],
  },

  /* -------------------------------------------------------
   * Top Hat
   * -----------------------------------------------------*/
  {
    key: "top_hat",
    name: "高礼帽",
    desc: "解锁高礼帽皮肤",
    tier: 7,
    deps: ["mazes"],
    levels: [
      {
        level: 0,
        requires: {
          hay: 1000000000,
          wood: 10000000000,
          carrot: 1000000000,
          cactus: 1000000000,
          gold: 100000000,
        },
      },
    ],
  },

  /* -------------------------------------------------------
   * Trees
   * -----------------------------------------------------*/
  {
    key: "trees",
    name: "树",
    tier: 4,
    deps: ["carrots"],
    desc: "解锁树木生产，并提升树的产能，使其成为高效稳定的木材来源。",
    levels: [
      {
        level: 0,
        requires: { wood: 50, carrot: 70 },
        ability: [{ name: "产量倍率", value: 1 }],
      },
      {
        level: 1,
        requires: { hay: 300 },
        ability: [{ name: "产量倍率", value: 2 }],
      },
      {
        level: 2,
        requires: { hay: 1200 },
        ability: [{ name: "产量倍率", value: 4 }],
      },
      {
        level: 3,
        requires: { hay: 4800 },
        ability: [{ name: "产量倍率", value: 8 }],
      },
      {
        level: 4,
        requires: { hay: 19200 },
        ability: [{ name: "产量倍率", value: 16 }],
      },
      {
        level: 5,
        requires: { hay: 76800 },
        ability: [{ name: "产量倍率", value: 32 }],
      },
      {
        level: 6,
        requires: { hay: 307000 },
        ability: [{ name: "产量倍率", value: 64 }],
      },
      {
        level: 7,
        requires: { hay: 1230000 },
        ability: [{ name: "产量倍率", value: 128 }],
      },
      {
        level: 8,
        requires: { hay: 4920000 },
        ability: [{ name: "产量倍率", value: 256 }],
      },
      {
        level: 9,
        requires: { hay: 19700000 },
        ability: [{ name: "产量倍率", value: 512 }],
      },
    ],
  },

  /* -------------------------------------------------------
   * Utilities
   * -----------------------------------------------------*/
  {
    key: "utilities",
    name: "random()",
    desc: "解锁工具类函数，比如random(),使你能够在游戏中生成随机数，为游戏添加更多的互动性和趣味性。",
    tier: 6,
    deps: ["functions"],
    levels: [{ level: 0, requires: { pumpkin: 1000 } }],
  },

  /* -------------------------------------------------------
   * Variables
   * -----------------------------------------------------*/
  {
    key: "variables",
    name: "let a = 2",
    desc: "解锁变量功能，使你能够在游戏中定义和使用变量，为游戏添加更多的互动性和趣味性。",
    tier: 4,
    deps: ["operators"],
    levels: [{ level: 0, requires: { carrot: 35 } }],
  },

  /* -------------------------------------------------------
   * Watering
   * -----------------------------------------------------*/
  {
    key: "watering",
    name: "浇水",
    desc: "解锁浇水功能，使你能够在游戏中为土壤浇水，提升其生长速度和产量。",
    tier: 4,
    deps: ["carrots"],

    levels: [
      {
        level: 0,
        requires: { wood: 50 },
        ability: [
          { name: "水资源每秒产出", value: 1 }, // 1/sec
        ],
      },
      {
        level: 1,
        requires: { wood: 200 },
        ability: [{ name: "水资源每秒产出", value: 2 }],
      },
      {
        level: 2,
        requires: { wood: 800 },
        ability: [{ name: "水资源每秒产出", value: 4 }],
      },
      {
        level: 3,
        requires: { wood: 3200 },
        ability: [{ name: "水资源每秒产出", value: 7 }],
      },
      {
        level: 4,
        requires: { wood: 12800 },
        ability: [{ name: "水资源每秒产出", value: 10 }],
      },
      {
        level: 5,
        requires: { wood: 51200 },
        ability: [{ name: "水资源每秒产出", value: 14 }],
      },
      {
        level: 6,
        requires: { wood: 205000 },
        ability: [{ name: "水资源每秒产出", value: 19 }],
      },
      {
        level: 7,
        requires: { wood: 819000 },
        ability: [{ name: "水资源每秒产出", value: 25 }],
      },
      {
        level: 8,
        requires: { wood: 3280000 },
        ability: [{ name: "水资源每秒产出", value: 32 }],
      },
    ],
  },
];
