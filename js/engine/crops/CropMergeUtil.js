
 export function isOverlap(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return !(ax2 < bx1 || bx2 < ax1 || ay2 < by1 || by2 < ay1);
  }
  export function isConflictWithResults(results, x1, y1, x2, y2) {
    for (const r of results) {
      if (
        isOverlap(x1, y1, x2, y2, r.x1, r.y1, r.x1 + r.n - 1, r.y1 + r.n - 1)
      ) {
        return true;
      }
    }
    return false;
  }