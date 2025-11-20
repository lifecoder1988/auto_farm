move(direction)
使实体向指定 direction 移动一格。
如果无人机即将移出农场边缘，则会绕回到农场的另一边。

"right"   =  右
"left"   =  左
"up"   =  上
"down"   =  下

如果实体移动了，则返回 true，否则返回 false。

如果实体移动了，需要 200 ticks 执行，否则需要 1 tick。

示例：
move("up")
