use_item(item, n=1) 
尝试使用指定的 item n 次。只能用于某些物品，包括 Items.Water、Items.Fertilizer。

如果使用了物品，则返回 True，否则返回 False。

如果成功，需要 200 ticks 执行，否则需要 1 tick。

示例：
use_item(Items.Fertilizer)

更多相关信息请见：<u><link="docs/unlocks/watering.md">Watering</link></u>