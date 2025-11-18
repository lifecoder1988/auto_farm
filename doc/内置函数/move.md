move(direction)
使无人机向指定 direction 移动一格。
如果无人机即将移出农场边缘，则会绕回到农场的另一边。

East   =  右
West   =  左
North  =  上
South  =  下

如果无人机移动了，则返回 True，否则返回 False。

如果无人机移动了，需要 200 ticks 执行，否则需要 1 tick。

示例：
move(North)

更多相关信息请见：<u><link="docs/unlocks/expand_1.md">Expand_1</link></u>