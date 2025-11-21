"use client";

import { initGame } from "./initGame";
import type { UiBridge } from "./types"; // ← 你需要新建这个文件（我下面会给）

async function waitAceReady() {
  // 等待 next/script 注入的 ace
  while (!(window as any).ace) {
    await new Promise((r) => setTimeout(r, 50));
  }

  // 等待 language_tools 就绪
  while (!(window as any).ace.require("ace/ext/language_tools")) {
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log("[initMain] Ace is fully ready.");
}

// -----------------------------
// initMain (主入口)
// -----------------------------

export interface InitMainOptions {
  saveData: any;
  slotId: number;
  slotName: string;
  ui: UiBridge;
}

export async function initMain(options: InitMainOptions) {
  console.log("[initMain] start...");

  await waitAceReady(); // ⭐ 所有 initGame 之前必须等待 Ace

  console.log("[initMain] Ace ready → initGame");

  initGame({
    saveData: options.saveData,
    slotId: options.slotId,
    slotName: options.slotName,
    ui: options.ui,
  });
}
