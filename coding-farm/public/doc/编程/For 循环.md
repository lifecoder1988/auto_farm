For 循环

for 循环语句的运行方式与 Python 中类似。（在某些语言中称为 foreach 循环，但不要与 C 语言风格的 for 循环混淆，那是不同的概念）。

for (const i of sequence) {
	// 用 i 做点什么
}

与 while 循环类似，for 循环会重复调用某个代码块。但它不是根据条件循环的，而是 sequence 中每有 1 个元素就执行 1 次循环体。

语法

for 循环语句的格式如下：

for (const variable_name of sequence) {
	// 代码块
}

variable_name 是你自定义变量的名称，它是 sequence 中的某个元素。sequence 是一个可以遍历的序列，比如一个数字范围、数组或字符串。每当 1 个元素被遍历到，循环体就会运行 1 次。

存储序列

<u><link="functions/range">范围</link></u>      <u><link="docs/scripting/lists.md">数组</link></u>      <u><link="docs/scripting/tuples.md">类数组对象</link></u>      <u><link="docs/scripting/dicts.md">对象键列表</link></u>      <u><link="docs/scripting/sets.md">Set 集合</link></u>

示例

for (const i of range(5)) {
	harvest()
}

这个循环会固定次数地执行循环体，基本上等同于如下代码：

let i = 0
harvest()
i = 1
harvest()
i = 2
harvest()
i = 3
harvest()
i = 4
harvest()

所以它会调用 5 次 harvest() 函数。

另请参阅<u><link="docs/scripting/break.md">Break</link></u>和<u><link="docs/scripting/continue.md">Continue</link></u>。
