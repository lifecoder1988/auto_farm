set_execution_speed(speed)
限制程序的执行速度，以便更好地观察执行效果。

speed 为 1 是无人机没有任何速度升级时的速度。
speed 为 8 使代码执行速度达到 8 倍，相当于无人机经过 3 次速度升级后的速度。
speed 为 0.5 使代码以无速度升级时的一半速度执行。半速执行有助于观察代码的执行过程。

如果 speed 快于当前可达到的执行速度上限，则直接以最大速度运行。

如果 speed 为 0 或负数，速度将恢复为最大速度。
当执行停止时，效果也会停止。

返回 None。

需要 200 ticks 执行。

示例：
set_execution_speed(1)

更多相关信息请见：<u><link="docs/unlocks/debug2.md">Debug2</link></u>