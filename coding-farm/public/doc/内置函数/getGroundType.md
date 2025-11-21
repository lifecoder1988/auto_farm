getGroundType() 
判断玩家下方地块的类型。

返回玩家下方地块的类型。
返回值为 grass 或者 soil。

需要 1 tick 执行。

示例：
if (getGroundType() != "soil") {
    till()
}

更多相关信息请见：<u><link="doc/解锁/senses.md">Senses</link></u>
