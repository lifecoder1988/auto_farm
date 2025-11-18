<line-height=50%><size=40px>For 循环</size>
</line-height>
for 循环语句的运行方式与 Python 中类似。（在某些语言中称为 foreach 循环，但不要与 C 语言风格的 for 循环混淆，那是不同的概念）。

for i in sequence:
	#用 i 做点什么

与 while 循环类似，for 循环会重复调用某个代码块。但它不是根据条件循环的，而是存储序列中每有 1 个元素就执行 1 次循环体。

<line-height=50%><size=32px>语法</size>
</line-height>
for 循环语句的格式如下：

for variable_name in sequence:
	#代码块

variable_name 是你自定义变量的名称，它是存储序列中的某个元素。sequence 是存储序列，存放多个元素，比如一个数字范围。每当 1 个元素被存储序列遍历 1 次，循环体就会运行 1 次。

<line-height=50%><size=32px>存储序列</size>
</line-height>
<u><link="functions/range">范围</link></u>      <u><link="docs/scripting/lists.md">列表</link></u>      <u><link="docs/scripting/tuples.md">元组</link></u>      <u><link="docs/scripting/dicts.md">字典</link></u>      <u><link="docs/scripting/sets.md">集合</link></u>

<line-height=50%><size=32px>示例</size>
</line-height>
for i in range(5):
    harvest()

这个循环会固定次数地执行循环体，基本上等同于如下代码：

i = 0
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