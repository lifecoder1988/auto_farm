// main.js
import { initGame } from "./game.js";
import { initStartUI } from "./ui/save-ui.js";

/**
 * 等待 Ace 编辑器加载完成
 */
function onAceReady(cb) {
  if (window.ace) return cb();

  const loader = document.getElementById("ace-loader");
  if (loader) {
    loader.addEventListener("load", () => cb());
  }

  const timer = setInterval(() => {
    if (window.ace) {
      clearInterval(timer);
      cb();
    }
  }, 50);
}

/**
 * 启动入口
 */
function start() {
  // 1. 不再立即 initGame！

  // 2. 初始化启动界面（新游戏 / 加载存档）
  initStartUI({
    onStartGame({ saveData, slotId, slotName }) {
      // ⭐ 等用户选择后再启动游戏
      initGame({ saveData, slotId, slotName });
    },
  });
}

onAceReady(start);
