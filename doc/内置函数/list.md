list(collection = None)
创建一个新列表。
如果 collection 是 None，则创建一个空列表。
如果 collection 是任何序列，则用该序列的元素创建一个新列表。

返回一个列表。

需要 1 + len(collection) ticks 执行。

示例：
new_list = list((1,2,3))

更多相关信息请见：<u><link="docs/scripting/lists.md">Lists</link></u>