useItem(item) 
尝试使用指定的 item n 次。只能用于某些物品，包括 Items.Water、Items.Fertilizer。

如果使用了物品，则返回 True，否则返回 False。

item 取值范围

    "pumpkin"   南瓜
      "gold"      金币
      "apple"     苹果
      "hay"       草料
      "wood"      木头
      "carrot"    胡萝卜
      "cactus"    仙人掌
      "sunflower" 向日葵
      "water"     水
      "fertilizer" 肥料
      
如果成功，需要 200 ticks 执行，否则需要 1 tick。

示例：
useItem(Items.Fertilizer)

更多相关信息请见：<u><link="doc/解锁/watering.md">Watering</link></u>
