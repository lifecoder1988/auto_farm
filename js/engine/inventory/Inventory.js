export class Inventory {
  constructor(initial = null) {
    // 初始化背包字段
    this.items = initial || {
      potato: 0,
      peanut: 0,
      pumpkin: 0,
      straw: 0,
      gold : 0,
      apple:0,
    };

    // 可选：监听器，用于 UI 刷新
    this.listeners = new Set();
  }

  /** 获取单个物品数量 */
  get(key) {
    return this.items[key] || 0;
  }

  /** 设置数量（慎用） */
  set(key, value) {
    this.items[key] = Math.max(0, value);
    this.notify();
  }

  /** 添加物品 */
  add(key, count = 1) {
    this.items[key] = (this.items[key] || 0) + count;
    this.notify();
  }

  /** 消耗物品 */
  remove(key, count = 1) {
    const cur = this.items[key] || 0;
    if (cur < count) return false; // 不够用
    this.items[key] = cur - count;
    this.notify();
    return true;
  }

  /** 返回所有物品 */
  getAll() {
    return { ...this.items };
  }

  /** 覆盖全部（重置用） */
  reset(initial) {
    this.items = { ...initial };
    this.notify();
  }

  /** 事件监听（用于 UI 自动刷新） */
  onChange(fn) {
    this.listeners.add(fn);
  }

  offChange(fn) {
    this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      try { fn(this.getAll()); } catch (_) {}
    }
  }
}
