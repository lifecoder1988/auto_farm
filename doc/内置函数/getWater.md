getWater() 
获取玩家下方地块的当前含水量。

返回玩家下方地块的含水量，为一个介于 0 和 1 之间的数字。

需要 1 tick 执行。

示例：
if (getWater() < 0.5) {
    useItem("water")
}

更多相关信息请见：<u><link="doc/解锁/watering.md">Watering</link></u>
