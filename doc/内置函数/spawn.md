spawn(function)
在运行 spawn(function) 命令的实体相同位置生成一个新的实体。新无人机随后开始执行指定的函数。完成后，它将自动消失。

返回新实体的句柄；如果所有实体都已生成，则返回 null。

如果生成了实体，需要 200 ticks 执行，否则需要 1 tick。

示例：
function harvestColumn() {
  const size = getWorldSize();
  for (let i = 0; i < size; i++) {
    harvest();
    move("up");  // North → "up"
  }
}

while (true) {
  const ok = spawn(async ({ move, harvest, getWorldSize }) => {
    await harvestColumn();
  });

  if (ok) {
    move("right");  // East → "right"
  }
}

更多相关信息请见：<u><link="doc/解锁/megafarm.md">Megafarm</link></u>
