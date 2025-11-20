// js/ui/save-ui.js

import { getCurrentTimeString } from "../utils/time.js";

const SAVE_META_KEY = "farm_save_slots"; // 存档槽列表
const SAVE_SLOT_PREFIX = "farm_save_slot_"; // 单个存档内容 key 前缀

export function loadSlotMetaList() {
  try {
    const raw = localStorage.getItem(SAVE_META_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveSlotMetaList(list) {
  localStorage.setItem(SAVE_META_KEY, JSON.stringify(list));
}

export function loadSlotData(slotId) {
  const raw = localStorage.getItem(SAVE_SLOT_PREFIX + slotId);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSlotData(slotId, data) {
  localStorage.setItem(SAVE_SLOT_PREFIX + slotId, JSON.stringify(data));
}

/**
 * 初始化启动 UI
 * @param {object} options
 * @param {(saveData:null|object)=>void} options.onStartGame  选好后调用：传 null 表示新游戏
 * @param {() => object} [options.onCollectSave]  可选：用于“立即保存当前游戏”
 */
export function initStartUI({ onStartGame, onCollectSave }) {
  const overlay = document.getElementById("start-overlay");
  const btnNew = document.getElementById("btn-new-game");
  const btnLoad = document.getElementById("btn-load-game");
  const saveWrap = document.getElementById("save-list-wrap");
  const slotListEl = document.getElementById("save-slot-list");
  const btnCreateEmpty = document.getElementById("btn-create-empty");

  if (!overlay || !btnNew || !btnLoad || !saveWrap || !slotListEl) {
    console.warn("[SaveUI] 元素未找到，启动 UI 未初始化");
    return;
  }

  // 渲染存档槽列表
  function renderSlotList() {
    const metaList = loadSlotMetaList();
    slotListEl.innerHTML = "";

    if (!metaList.length) {
      const li = document.createElement("li");
      li.textContent = "暂无存档，可以点击“新建空存档槽”。";
      li.style.opacity = "0.7";
      li.style.fontSize = "12px";
      slotListEl.appendChild(li);
      return;
    }

    metaList.forEach((meta) => {
      const li = document.createElement("li");
      li.className = "save-slot-item";

      const main = document.createElement("div");
      main.className = "save-slot-main";

      const nameEl = document.createElement("span");
      nameEl.className = "save-slot-name";
      nameEl.textContent = meta.name || `存档槽 ${meta.id}`;

      const timeEl = document.createElement("span");
      timeEl.className = "save-slot-meta";
      const t = meta.savedAt ? new Date(meta.savedAt) : null;
      timeEl.textContent = t ? `上次保存：${t.toLocaleString()}` : "尚未保存";

      main.appendChild(nameEl);
      main.appendChild(timeEl);

      const actions = document.createElement("div");
      actions.className = "save-slot-actions";

      const btnLoadSlot = document.createElement("button");
      btnLoadSlot.textContent = "加载";
      btnLoadSlot.className = "small";
      btnLoadSlot.addEventListener("click", () => {
        const data = loadSlotData(meta.id);
        overlay.classList.add("hidden");
        onStartGame?.({
          saveData: data || null,
          slotId: meta.id,
          slotName: meta.name,
        });
      });

      const btnOverwrite = document.createElement("button");
      btnOverwrite.textContent = "覆盖";
      btnOverwrite.className = "small secondary";
      btnOverwrite.addEventListener("click", () => {
        if (!onCollectSave) return;
        const data = onCollectSave();
        const now = Date.now();

        // 更新 meta
        meta.savedAt = now;
        saveSlotData(meta.id, data);
        saveSlotMetaList(metaList);
        renderSlotList();
      });

      const btnDelete = document.createElement("button");
      btnDelete.textContent = "删除";
      btnDelete.className = "small secondary";
      btnDelete.addEventListener("click", () => {
        if (!confirm(`确定删除存档 "${meta.name}" 吗？`)) return;
        const idx = metaList.findIndex((m) => m.id === meta.id);
        if (idx >= 0) metaList.splice(idx, 1);
        localStorage.removeItem(SAVE_SLOT_PREFIX + meta.id);
        saveSlotMetaList(metaList);
        renderSlotList();
      });

      actions.appendChild(btnLoadSlot);
      actions.appendChild(btnOverwrite);
      actions.appendChild(btnDelete);

      li.appendChild(main);
      li.appendChild(actions);
      slotListEl.appendChild(li);
    });
  }

  // 新游戏：不带存档启动
  btnNew.addEventListener("click", () => {
    const metaList = loadSlotMetaList();

    // 自动生成 slot ID
    const newId = metaList.length
      ? Math.max(...metaList.map((m) => m.id)) + 1
      : 1;

    const name = "存档 " + getCurrentTimeString();
     

    const meta = {
      id: newId,
      name,
      savedAt: null, // 新建存档槽，没有保存内容
    };

    // 写入 localStorage
    metaList.push(meta);
    saveSlotMetaList(metaList);

    // 隐藏选择界面并进入游戏
    overlay.classList.add("hidden");
    onStartGame?.({
      saveData: null,
      slotId: newId,
      slotName: name,
    });
  });

  // 展开“加载存档”区域
  btnLoad.addEventListener("click", () => {
    saveWrap.classList.remove("hidden");
    renderSlotList();
  });

  // 新建空存档槽（只是创建一个 meta，不立即保存状态）
  btnCreateEmpty?.addEventListener("click", () => {
    const metaList = loadSlotMetaList();
    const id = metaList.length ? Math.max(...metaList.map((m) => m.id)) + 1 : 1;
    const name = prompt("请输入存档名称：", `存档 ${id}`) || `存档 ${id}`;
    const meta = { id, name, savedAt: null };
    metaList.push(meta);
    saveSlotMetaList(metaList);
    renderSlotList();
  });
}

/**
 * 可选：游戏运行中提供“保存游戏”按钮时用
 */
export function saveCurrentToDefaultSlot(app) {
  const metaList = loadSlotMetaList();
  if (!metaList.length) {
    alert("还没有存档槽，请先在启动界面创建一个存档槽。");
    return;
  }
  const slot = metaList[0]; // 简单：默认存到第一个
  const data = app.collectSaveData();

  console.log(data)
  
  slot.savedAt = Date.now();
  saveSlotMetaList(metaList);
  saveSlotData(slot.id, data);
  alert(`已保存到 "${slot.name}"`);
}
