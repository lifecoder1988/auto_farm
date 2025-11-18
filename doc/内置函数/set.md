set(collection = None)
创建一个新集合。
如果 collection 是 None，则创建一个空集合。
如果 collection 是一个值的集合，则用这些值创建一个新集合。

返回一个集合。

需要 1 + len(collection) ticks 执行。

示例：
new_set = set((1,2,3))

更多相关信息请见：<u><link="docs/scripting/dicts.md">Dicts</link></u>