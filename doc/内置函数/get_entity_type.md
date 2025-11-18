get_entity_type() 
判断无人机下方实体的类型。

如果地块为空，则返回 None，否则返回无人机下方实体的类型。

需要 1 tick 执行。

示例：
if get_entity_type() == Entities.Grass:
    harvest()

更多相关信息请见：<u><link="docs/unlocks/senses.md">Senses</link></u>