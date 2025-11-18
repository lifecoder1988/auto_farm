swap(direction)
将无人机下方的实体与指定 direction 方向上相邻的实体交换。
并非对所有实体都有效。
如果其中一个（或两个）实体为 None，也同样有效。

如果成功，则返回 True，否则返回 False。

成功时需要 200 ticks 执行，否则需要 1 tick。

示例：
swap(North)

更多相关信息请见：<u><link="docs/unlocks/cactus.md">Cactus</link></u>