// engine/crops/CropMerge.js
import { buildPumpkinPrefix, rectSum } from "./CropPrefix.js";
import { isConflictWithResults } from "./CropMergeUtil.js";

export function detectSquaresUnique(cropManager, worldSize) {
  const psPumpkin = buildPumpkinPrefix(cropManager, worldSize);
  const results = [];

  // 外层：从大到小
  for (let n = worldSize; n >= 2; n--) {
    const need = n * n;

    for (let x = 0; x <= worldSize - n; x++) {
      for (let y = 0; y <= worldSize - n; y++) {
        const x1 = x;
        const y1 = y;
        const x2 = x + n - 1;
        const y2 = y + n - 1;

        // 满正方形检测
        if (rectSum(psPumpkin, x1, y1, x2, y2) !== need) continue;

        // 冲突检测（不使用 used[][]，直接查 results）
        if (isConflictWithResults(results, x1, y1, x2, y2)) continue;

        // √ 合格正方形
        results.push({ x1, y1, n });
      }
    }
  }

  return results;
}

export function applyMergeArea(cropManager, area) {
  const { x1, y1, n } = area;

  for (let dx = 0; dx < n; dx++) {
    for (let dy = 0; dy < n; dy++) {
      const crop = cropManager.get(x1 + dx, y1 + dy);
      if (crop) crop.mergeArea = { x: x1, y: y1, n };
    }
  }
}
