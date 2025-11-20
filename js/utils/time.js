// js/utils/time.js

/**
 * 返回格式化的当前时间
 * 格式：YYYY-MM-DD HH:mm:ss
 */
export function getCurrentTimeString() {
  const t = new Date();

  const YYYY = t.getFullYear();
  const MM = String(t.getMonth() + 1).padStart(2, "0");
  const DD = String(t.getDate()).padStart(2, "0");

  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  const ss = String(t.getSeconds()).padStart(2, "0");

  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}
