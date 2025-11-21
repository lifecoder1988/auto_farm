// utils/tween.js
export function smooth(obj, prop, target, factor = 0.15) {
  obj[prop] += (target - obj[prop]) * factor;
}

export function smoothScale(sprite, targetScale, factor = 0.18) {
  sprite.scale.x += (targetScale - sprite.scale.x) * factor;
  sprite.scale.y += (targetScale - sprite.scale.y) * factor;
}

export function tweenAlpha(sprite, target, duration) {
  const start = sprite.alpha;
  const delta = target - start;
  const startTime = performance.now();
  function update() {
    const t = (performance.now() - startTime) / duration;
    if (t >= 1) {
      sprite.alpha = target;
      return;
    }
    sprite.alpha = start + delta * t;
    requestAnimationFrame(update);
  }
  update();
}

export function tweenScale(sprite, target, duration) {
  const start = sprite.scale.x;
  const delta = target - start;
  const startTime = performance.now();
  function update() {
    const t = (performance.now() - startTime) / duration;
    if (t >= 1) {
      sprite.scale.set(target);
      return;
    }
    const v = start + delta * t;
    sprite.scale.set(v);
    requestAnimationFrame(update);
  }
  update();
}
