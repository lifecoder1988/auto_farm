export class UnlockManager {
  constructor({ inventory, techLevels = {}, unlocks = {}, techTree = [] }) {
    this.inventory = inventory;   // Inventory 实例
    this.techLevels = techLevels; // { key: level }
    this.unlocks = unlocks;       // { key: true }
    this.techTree = techTree;     // TECH_TREE

    this.listeners = new Set();   // UI 自动刷新
  }

  /** 找到指定科技节点 */
  getNode(key) {
    return this.techTree.find(n => n.key === key);
  }

  /** 当前等级 */
  getLevel(key) {
    return Number(this.techLevels[key] || 0);
  }

  /** 是否已解锁 */
  isUnlocked(key) {
    return !!this.unlocks[key];
  }

  /** 监听变化（用于 UI 刷新） */
  onChange(fn) { this.listeners.add(fn); }
  offChange(fn) { this.listeners.delete(fn); }
  notify() {
    for (const fn of this.listeners) {
      try { fn(); } catch (_) {}
    }
  }

  /** 是否可以解锁 */
  canUnlock(key) {
    const node = this.getNode(key);
    if (!node) return false;
    if (this.unlocks[key]) return false;

    const totals = this.inventory.getAll();

    // 物品需求
    for (const k in (node.requires || {})) {
      if ((totals[k] || 0) < node.requires[k]) return false;
    }

    // 依赖前置科技
    for (const dep of (node.deps || [])) {
      if (!this.unlocks[dep]) return false;
    }

    return true;
  }

  /** 执行解锁 */
  unlock(key) {
    if (!this.canUnlock(key)) return false;

    const node = this.getNode(key);

    // 扣除材料
    for (const k in (node.requires || {})) {
      this.inventory.remove(k, node.requires[k]);
    }

    this.unlocks[key] = true;
    this.notify();
    return true;
  }

  /** 是否可以升级 */
  canUpgrade(key) {
    const node = this.getNode(key);
    if (!node) return false;

    if (!node.maxLevel) return false;
    if (!this.unlocks[key]) return false;
    
    const cur = this.getLevel(key);
    if (cur >= node.maxLevel) return false;

    const totals = this.inventory.getAll();

    for (const k in (node.requires || {})) {
      if ((totals[k] || 0) < node.requires[k]) return false;
    }

    return true;
  }

  /** 执行升级 */
  upgrade(key) {
    if (!this.canUpgrade(key)) return false;

    const node = this.getNode(key);

    // 扣材料
    for (const k in (node.requires || {})) {
      this.inventory.remove(k, node.requires[k]);
    }

    // 等级 +1
    this.techLevels[key] = this.getLevel(key) + 1;
    this.notify();
    return true;
  }

  /** 返回所有科技点是否可解锁，用于 UI 高亮 */
  computeEligibility() {
    const result = {};
    for (const node of this.techTree) {
      result[node.key] = this.canUnlock(node.key);
    }
    return result;
  }
}
