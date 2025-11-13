// main.js
import { initGame } from './game.js';

function onAceReady(cb) {
  if (window.ace) return cb();
  const s = document.getElementById('ace-loader');
  if (s) s.addEventListener('load', () => cb());
  const t = setInterval(() => {
    if (window.ace) {
      clearInterval(t);
      cb();
    }
  }, 50);
}

onAceReady(initGame);
