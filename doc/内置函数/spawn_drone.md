spawn_drone(function)
在运行 spawn_drone(function) 命令的无人机相同位置生成一个新的无人机。新无人机随后开始执行指定的函数。完成后，它将自动消失。

返回新无人机的句柄；如果所有无人机都已生成，则返回 None。

如果生成了无人机，需要 200 ticks 执行，否则需要 1 tick。

示例：
def harvest_column():
    for _ in range(get_world_size()):
        harvest()
        move(North)

while True:
    if spawn_drone(harvest_column):
        move(East)

更多相关信息请见：<u><link="docs/unlocks/megafarm.md">Megafarm</link></u>