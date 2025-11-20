getCropType() 
判断玩家下方实体的类型。

如果地块为空，则返回 None，否则返回玩家下方实体的类型。
返回值为 

南瓜
草
灌木丛
胡萝卜
树
仙人掌
向日葵

需要 1 tick 执行。

示例：
if (getCropType() == "tree") {
    harvest()
}

更多相关信息请见：<u><link="doc/解锁/senses.md">Senses</link></u>
