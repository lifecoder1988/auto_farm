const INDEX_KEY = "GAME_SAVES_INDEX";

// 读取索引
export function getSaveIndex() {
  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// 保存索引
function setSaveIndex(list) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

// 创建新 slotId
export function createNewSlot() {
  const index = getSaveIndex();
  let id = 0;

  while (index.includes("slot_" + id)) {
    id++;
  }

  const slotId = "slot_" + id;
  index.push(slotId);
  setSaveIndex(index);

  return slotId;
}

// 删除某个存档槽
export function deleteSlot(slotId) {
  localStorage.removeItem("GAME_SAVE_" + slotId);

  const index = getSaveIndex().filter((s) => s !== slotId);
  setSaveIndex(index);
}

// 保存到指定槽
export function saveToSlot(slotId, data) {
  localStorage.setItem("GAME_SAVE_" + slotId, JSON.stringify(data));
}

// 从指定槽读取
export function loadFromSlot(slotId) {
  const raw = localStorage.getItem("GAME_SAVE_" + slotId);
  if (!raw) return null;
  return JSON.parse(raw);
}
