range(start = 0, end, step = 1)
生成一个数字序列，从 start 开始，在到达 end 之前结束（所以不包括 end），步长为 step。

注意，start 默认设置为 0，如果只给出一个参数，则会绑定到 end。这在通常情况下是不可能的。
而在 Python 中，range 是一个类构造函数，允许这种奇怪的行为。

需要 1 tick 执行。

示例：
for i in range(10):
    print(i)

for i in range(2,6):
    print(i)

for i in range(10, 0, -1):
    print(i)