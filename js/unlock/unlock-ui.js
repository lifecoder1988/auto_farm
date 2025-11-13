// js/unlock/unlock-ui.js
import { renderUnlockPixi } from './unlock-pixi.js';

let appRef = null;
let TECH_TREE_REF = null;

let elOverlay, elGraph, elScroll;

export function initUnlockUI(app, TECH_TREE) {
  appRef = app;
  TECH_TREE_REF = TECH_TREE;

  console.log('initUnlockUI', app, TECH_TREE);

  elOverlay = document.getElementById('tech-overlay');
  elGraph = document.getElementById('tech-graph');
  elScroll = document.getElementById('tech-scroll');

  // 绑定按钮
  document.getElementById('toggle-tech')
    .addEventListener('click', ()=> toggleUnlock(true));

  document.getElementById('tech-close')
    .addEventListener('click', ()=> toggleUnlock(false));

  // 初次不渲染，打开再渲染
}

export function toggleUnlock(show) {
  if (!elOverlay) return;
  elOverlay.style.display = show ? 'block' : 'none';

  if (show) {
    updateUnlock();
  }
}

export function updateUnlock() {
  if (!appRef || !elGraph) return;
  renderUnlockPixi(appRef, TECH_TREE_REF, elGraph);
}
