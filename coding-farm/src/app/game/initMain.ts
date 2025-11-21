"use client";

import { initStartUI } from "./ui/save-ui";
import { initGame } from "./game";

// -----------------------------
// 1) 动态加载 Ace（CDN版）
// -----------------------------

let aceLoading = false;
let aceReady = false;

function loadAceScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Load script failed: " + src));
    document.body.appendChild(script);
  });
}

async function loadAceFromCDN() {
  if (aceReady) return;

  if (aceLoading) {
    // 等待别的地方加载完成
    while (!aceReady) await new Promise((r) => setTimeout(r, 30));
    return;
  }

  aceLoading = true;

  console.log("[initMain] Loading Ace...");

  // 加载 ace 基础
  await loadAceScript(
    "https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-min-noconflict/ace.js"
  );

  // 加载自动补全插件
  await loadAceScript(
    "https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/ext-language_tools.js"
  );

  // 再等待一下确保 window.ace 初始化完毕
  await new Promise((r) => setTimeout(r, 50));

  aceReady = true;

  console.log("[initMain] Ace loaded.");
}

/**
 * 等价于旧版 onAceReady(cb)
 */
async function waitAceReady() {
  if (aceReady || (window as any).ace) return;
  await loadAceFromCDN();
}

// -----------------------------
// 2) initMain（核心入口）
// -----------------------------

export async function initMain() {
  console.log("[initMain] start...");

  // ⭐ 等 Ace 加载完成
  await waitAceReady();

  console.log("[initMain] Ace ready, now init StartUI...");

  // ⭐ 初始化启动界面（显示 新游戏 / 加载存档）
  initStartUI({
    onStartGame({ saveData, slotId, slotName }) {
      console.log("[initMain] User selected slot -> Init Game");
      initGame({ saveData, slotId, slotName });
    },
  });
}
