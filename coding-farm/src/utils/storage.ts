export const SAVE_META_KEY = "farm_save_slots";
export const SAVE_SLOT_PREFIX = "farm_save_slot_";

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

export function saveSlotMetaList(list: any[]) {
  localStorage.setItem(SAVE_META_KEY, JSON.stringify(list));
}

export function loadSlotData(slotId: number) {
  const raw = localStorage.getItem(SAVE_SLOT_PREFIX + slotId);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSlotData(slotId: number, data: any) {
  localStorage.setItem(SAVE_SLOT_PREFIX + slotId, JSON.stringify(data));
}
