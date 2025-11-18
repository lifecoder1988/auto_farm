export class UnlockManager {
  constructor({ inventory, techLevels = {}, unlocks = {}, techTree = [] }) {
    this.inventory = inventory;
    this.techLevels = techLevels; // { key: number }
    this.unlocks = unlocks;       // { key: true }
    this.techTree = techTree;

    this.listeners = new Set();
  }

  /** 根据当前等级，返回该节点需要的 materials */
  getCurrentRequires(node) {
    if (!node.levels) return node.requires || {};

    const lv = this.getLevel(node.key);
    const info = node.levels[lv];
    if (!info) return null;  // 已达最高级

    return info.requires || {};
  }

  /** 最大等级 */
  getMaxLevel(node) {
    if (!node.levels) return node.maxLevel || 0;
    return node.levels.length - 1;
  }

  getNode(key) {
    return this.techTree.find(n => n.key === key);
  }

  getLevel(key) {
    return Number(this.techLevels[key] || 0);
  }

  isUnlocked(key) {
    return !!this.unlocks[key];
  }

  onChange(fn) { this.listeners.add(fn); }
  offChange(fn) { this.listeners.delete(fn); }
  notify() { this.listeners.forEach(fn => fn()); }

  canUnlock(key) {
    const node = this.getNode(key);
    if (!node) return false;
    if (this.isUnlocked(key)) return false;

    // 检查依赖
    for (const dep of (node.deps || [])) {
      if (!this.isUnlocked(dep)) return false;
    }

    // 材料要求
    const req = this.getCurrentRequires(node);
    if (!req) return false;

    const bag = this.inventory.getAll();
    for (const k in req) {
      if ((bag[k] || 0) < req[k]) return false;
    }

    return true;
  }

  unlock(key) {
    if (!this.canUnlock(key)) return false;

    const node = this.getNode(key);
    const req = this.getCurrentRequires(node);

    // 扣材料
    for (const k in req) this.inventory.remove(k, req[k]);

    // 标记解锁（等级 0）
    this.unlocks[key] = true;
    this.techLevels[key] = 0;

    this.notify();
    return true;
  }

  canUpgrade(key) {
    const node = this.getNode(key);
    if (!node) return false;
    if (!this.isUnlocked(key)) return false;

    const lv = this.getLevel(key);
    const maxLv = this.getMaxLevel(node);
    if (lv >= maxLv) return false;

    const req = node.levels[lv + 1].requires;
    const bag = this.inventory.getAll();
    for (const k in req) {
      if ((bag[k] || 0) < req[k]) return false;
    }

    return true;
  }

  upgrade(key) {
    if (!this.canUpgrade(key)) return false;

    const node = this.getNode(key);
    const lv = this.getLevel(key);
    const req = node.levels[lv + 1].requires;

    // 扣材料
    for (const k in req) this.inventory.remove(k, req[k]);

    // 提升等级
    this.techLevels[key] = lv + 1;
    this.notify();
    return true;
  }

  computeEligibility() {
    const result = {};
    for (const node of this.techTree) {
      result[node.key] = this.canUnlock(node.key);
    }
    return result;
  }
}
