If 语句

作用是条件判断，你可以使用 if、else if 和 else 来选择性地运行代码。

if (condition1) {
	doAFlip()
} else if (condition2) {
	harvest()
} else {
	doAFlip()
	harvest()
}

语法

if 语句会让代码块在某个条件为 true 时运行，如同一个不循环的 while 判断。
if 语句会判断条件，如果判断结果为 true，则执行 if 代码块：

// 如果条件为 true，则翻转
if (condition) {
	doAFlip()
}

你还可以在 if 之后添加 1 个 else，后者定义的是当 if 判断结果为 false 时需要执行的代码。

如果 condition 为 true，则翻转，否则收获。
if (condition) {
	doAFlip()
} else {
	harvest()
}

else if 是 else 和 if 的组合。

if (condition1) {
	// a
} else {
	if (condition2) {
		// b
	} else {
		// c
	}
}

可以缩短为：

if (condition1) {
	// a
} else if (condition2) {
	// b
} else {
	// c
}
