has_finished(drone)
检查给定的 drone 是否已完成。

如果 drone 已完成，则返回 True，否则返回 False。

需要 1 tick 执行。

示例：
drone = spawn_drone(function)
while not has_finished(drone):
    do_something_else()
result = wait_for(drone)

更多相关信息请见：<u><link="docs/unlocks/megafarm.md">Megafarm</link></u>