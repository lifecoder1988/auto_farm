random()
抽取一个介于 0（含）和 1（不含）之间的随机数。

返回该随机数。

需要 1 tick 执行。

示例：
function randomElem(arr) {
	index = random() * arr.length // 1
	return arr[index]
}