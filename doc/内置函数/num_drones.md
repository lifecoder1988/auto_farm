num_drones()

返回当前农场中的无人机数量。

需要 1 tick 执行。

示例：
while num_drones() < max_drones():
    spawn_drone("some_file_name")
    move(East)

更多相关信息请见：<u><link="docs/unlocks/megafarm.md">Megafarm</link></u>