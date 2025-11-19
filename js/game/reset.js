// js/game/reset.js

export function setupReset(app) {

  app.resetGame = () => {
    // 1. 停止用户代码运行
    app.abortRun?.();

    // 2. 删除所有迷宫
    app.mazeManager?.deleteAll();

    // 3. 重置实体
    app.entityManager?.reset();

    // 4. 重置作物
    app.cropManager?.reset();

    // 5. 土壤层重置
    const size = app.gameState.world.size;
    const tile = app.gameState.world.tileSize;
    app.soilManager?.resetLayer(size, tile);

    // 6. 清空 crop debug 渲染
    app.cropDebug?.clear();

    // 7. 重绘地图
    app.rebuildWorld?.();

    // 8. 更新背包 UI
    app.updateInventory?.();

    // 9. 显示消息
    if (app.msg) app.msg.textContent = "已重置 ⟳";

    console.log("游戏已重置");
  };
}
