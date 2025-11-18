num_unlocked(thing)
用于检查某个解锁项、实体、地块、物品或帽子是否已经解锁。

如果 thing 可升级，则返回 1 加上 thing 已升级的次数。如果不可升级，则在 thing 已解锁时返回 1，否则返回 0。

需要 1 tick 执行。

示例：
plant(Entities.Bush)
n_substance = get_world_size() * num_unlocked(Unlocks.Mazes)
use_item(Items.Weird_Substance, n_substance)

更多相关信息请见：<u><link="docs/unlocks/senses.md">Senses</link></u>