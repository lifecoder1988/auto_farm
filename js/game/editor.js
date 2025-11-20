// js/game/editor.js
import { DEFAULT_CODE } from "../data/default_code.js";

export function setupEditor(app, saveData = null) {
  const editor = ace.edit("editor");

  // 设置初始化代码（支持从存档恢复）
  const initialCode = saveData?.editor?.code || DEFAULT_CODE;
  editor.setValue(initialCode, -1);

  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/javascript");
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
  });

  // 自定义 API 提示（先不动）
  setupCustomCompletions();

  // 将 editor 挂到 app 上（方便 save/restore 使用）
  app.editor = editor;
}

// -------------------------
// 自定义 Ace 自动补全
// -------------------------
function setupCustomCompletions() {
  const customCompleter = {
    getCompletions(editor, session, pos, prefix, callback) {
      const list = [
        { caption: "till", value: "till()", meta: "game api" },
        { caption: "useWater", value: "useWater()", meta: "game api" },
        { caption: "getWater", value: "getWater()", meta: "game api" },
        { caption: "getWorldSize", value: "getWorldSize()", meta: "game api" },
        {
          caption: "useFertilizer",
          value: "useFertilizer()",
          meta: "game api",
        },
        {
          caption: "getGroundType",
          value: "getGroundType()",
          meta: "game api",
        },
        { caption: "getCropType", value: "getCropType()", meta: "game api" },
        { caption: "canHarvest", value: "canHarvest()", meta: "game api" },
        { caption: "canMove", value: "canMove()", meta: "game api" },
        { caption: "clear", value: "clear()", meta: "game api" },
        { caption: "random", value: "random()", meta: "game api" },
        { caption: "max", value: "max()", meta: "game api" },
        { caption: "min", value: "min()", meta: "game api" },
        { caption: "abs", value: "abs()", meta: "game api" },
        {
          caption: "getMaxEntityCount",
          value: "getMaxEntityCount()",
          meta: "game api",
        },
        {
          caption: "getEntityCount",
          value: "getEntityCount()",
          meta: "game api",
        },
        {
          caption: "numItems",
          value: "numItems(itemType)",
          meta: "game api",
          docHTML: `
    <b>numItems(itemType)</b><br/>
    获取背包中指定物品的数量。<br/><br/>
    <b>参数 itemType（字符串）：</b><br/>
    可以是以下之一：<br/>
    <code>
      "pumpkin"   南瓜<br/>
      "gold"      金币<br/>
      "apple"     苹果<br/>
      "hay"       草料<br/>
      "wood"      木头<br/>
      "carrot"    胡萝卜<br/>
      "cactus"    仙人掌<br/>
      "sunflower" 向日葵<br/>
      "water"     水<br/>
      "fertilizer" 肥料<br/>
    </code><br/>
    <b>返回值：</b> 数字，当前拥有的数量。
  `,
        },

        { caption: "measure", value: "measure()", meta: "game api" },

        {
          caption: "console.log(msg)",
          value: "console.log('hello world')",
          meta: "game api",
          docHTML: "<b>console.log(msg)</b><br/>打印消息到控制台。",
        },
        {
          caption: "move(dir)",
          value: "move('up')",
          meta: "game api",
          docHTML:
            "<b>move(dir)</b><br/>角色移动：'up'/'down'/'left'/'right'。",
        },

        {
          caption: "setWorldSize(size)",
          value: "setWorldSize(10)",
          meta: "game api",
          docHTML: "<b>setWorldSize(size)</b><br/>修改地图尺寸。",
        },

        {
          caption: "createMaze(n)",
          value: "createMaze(3)",
          meta: "game api",
          docHTML: "<b>createMaze(n)</b><br/>生成迷宫。",
        },

        {
          caption: "plant(type)",
          value: "plant('土豆')",
          meta: "game api",
          docHTML: "<b>plant(type)</b><br/>种植作物。",
        },

        {
          caption: "harvest()",
          value: "harvest()",
          meta: "game api",
          docHTML: "<b>harvest()</b><br/>收获作物。",
        },

        {
          caption: "changeCharacter(type)",
          value: "changeCharacter('dino')",
          meta: "game api",
          docHTML: "<b>changeCharacter(type)</b><br/>切换角色外观。",
        },

        {
          caption: "spawn(async ({ move, plant, harvest, id }) => {})",
          meta: "snippet",
          value: `spawn(async ({ move, plant, harvest, id }) => {
  await move(0, 1)
  await plant('土豆')
  await harvest()
})`,
          docHTML: "<b>spawn(callback)</b><br/>创建一个分身，可并行运行。",
        },
      ];

      callback(null, list);
    },
  };

  ace.require("ace/ext/language_tools").addCompleter(customCompleter);
}
