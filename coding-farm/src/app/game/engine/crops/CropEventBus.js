// 简单轻量、无依赖的事件总线
export const CropEventBus = {
  listeners: {},

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  },

  off(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  },

  broadcast(event, ...args) {
    if (!this.listeners[event]) return;
    for (const fn of this.listeners[event]) fn(...args);
  }
};
