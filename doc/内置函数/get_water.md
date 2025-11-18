get_water() 
获取无人机下方地块的当前含水量。

返回无人机下方地块的含水量，为一个介于 0 和 1 之间的数字。

需要 1 tick 执行。

示例：
if get_water() < 0.5:
    use_item(Items.Water)

更多相关信息请见：<u><link="docs/unlocks/watering.md">Watering</link></u>