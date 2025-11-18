set_world_size(size)
限制农场的大小，以便更好地观察农场情况。
同时会清空农场并重置无人机位置。
将农场设置为 size x size 的网格。
可能的最小 size 是 3。
当 size 小于 3 时，会将网格恢复到其完整大小。
当执行停止时，效果也会停止。

返回 None。

需要 200 ticks 执行。

示例：
set_world_size(5)

更多相关信息请见：<u><link="docs/unlocks/debug2.md">Debug2</link></u>