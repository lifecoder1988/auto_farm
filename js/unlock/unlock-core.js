// js/unlock/unlock-core.js
export function getTotals(app) {
  return app?.state?.items ? { ...app.state.items } : {};
}

export function getTechLevel(app, key) {
  return Number(app?.state?.techLevels?.[key] || 0);
}

export function isUnlocked(app, key) {
  return !!app?.state?.unlocks?.[key];
}

export function computeEligibility(app, TECH_TREE) {
  const eligible = {};
  const totals = getTotals(app);
  const unlocked = app.state.unlocks || {};

  const sorted = TECH_TREE.slice().sort((a,b)=> (a.tier||0)-(b.tier||0));

  for (const node of sorted) {
    const reqs = node.requires || {};
    const deps = node.deps || [];

    let okItems = true;
    for (const k in reqs) {
      if ((totals[k] || 0) < reqs[k]) { okItems = false; break; }
    }

    let okDeps = true;
    for (const d of deps) {
      if (!unlocked[d]) { okDeps = false; break; }
    }

    eligible[node.key] = okItems && okDeps;
  }

  return eligible;
}

export function unlockTech(app, node) {
  if (!app.state.unlocks) app.state.unlocks = {};
  if (app.state.unlocks[node.key]) return true;

  const totals = getTotals(app);
  const reqs = node.requires || {};

  for (const k in reqs) {
    if ((totals[k] || 0) < reqs[k]) return false;
  }

  for (const k in reqs) {
    app.state.items[k] -= reqs[k];
    if (app.state.items[k] < 0) app.state.items[k] = 0;
  }

  app.state.unlocks[node.key] = true;
  return true;
}

export function canUpgrade(app, node) {
  const maxLv = Number(node.maxLevel || 0);
  if (!maxLv) return false;
  if (!isUnlocked(app, node.key)) return false;

  const curLv = getTechLevel(app, node.key);
  if (curLv >= maxLv) return false;

  const totals = getTotals(app);
  const reqs = node.requires || {};
  for (const k in reqs) {
    if ((totals[k] || 0) < reqs[k]) return false;
  }

  return true;
}

export function upgradeTech(app, node) {
  if (!canUpgrade(app, node)) return false;

  const reqs = node.requires || {};
  for (const k in reqs) {
    app.state.items[k] -= reqs[k];
    if (app.state.items[k] < 0) app.state.items[k] = 0;
  }

  const lv = getTechLevel(app, node.key) + 1;
  app.state.techLevels[node.key] = lv;
  return true;
}
