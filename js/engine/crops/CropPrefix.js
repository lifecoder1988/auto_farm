

export function  buildPumpkinPrefix(cropManager,worldSize) {
    // ps 尺寸用 (worldSize+1) × (worldSize+1)，方便做 [0,x] 的累加
    const ps = Array.from({ length: worldSize + 1 }, () =>
      Array(worldSize + 1).fill(0)
    );

    const get = (x, y) => cropManager.get(x, y);

    for (let x = 0; x < worldSize; x++) {
      for (let y = 0; y < worldSize; y++) {
        const c = get(x, y);
        const v = c && c.type === "南瓜" && c.isMature ? 1 : 0;

        // 标准 2D 前缀和：ps[x+1][y+1] 表示 [0..x, 0..y] 之和
        ps[x + 1][y + 1] = v + ps[x][y + 1] + ps[x + 1][y] - ps[x][y];
      }
    }

    return ps;
  }


export function rectSum(ps, x1, y1, x2, y2) {
    // 注意 ps 是 +1 偏移
    return ps[x2 + 1][y2 + 1] - ps[x1][y2 + 1] - ps[x2 + 1][y1] + ps[x1][y1];
  }