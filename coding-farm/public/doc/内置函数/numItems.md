numItems(item)
查询你当前拥有多少 item。

返回你物品栏中当前 item 的数量。

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

需要 1 tick 执行。

示例：
if(numItems("gold") > 0){
    useItem("gold")
}

更多相关信息请见：<u><link="doc/解锁/senses.md">Senses</link></u>
