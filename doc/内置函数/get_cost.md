get_cost(thing) 
获取一个 thing 的成本。

如果 thing 是一个实体，获取种植它的成本。
如果 thing 是一个解锁项，获取解锁它的成本。

返回一个字典，其中键是物品，值是数量。每个物品映射到它需要的数量。
当用于已经达到最高等级的可升级解锁项时，返回 {}。

需要 1 tick 执行。

示例：
cost = get_cost(Unlocks.Carrots)
for item in cost:
    if num_items(item) < cost[item]:
        print("物品不足，无法解锁胡萝卜")

更多相关信息请见：<u><link="docs/unlocks/costs.md">Costs</link></u>