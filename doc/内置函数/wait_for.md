wait_for(drone)
等待直到给定的 drone 终止。

返回 drone 正在运行的函数的返回值。

如果等待的 drone 已经完成，需要 1 tick 执行。

示例：
def get_entity_type_in_direction(dir):
    move(dir)
    return get_entity_type()

def zero_arg_wrapper():
    return get_entity_type_in_direction(North)
handle = spawn_drone(zero_arg_wrapper)
print(wait_for(handle))

更多相关信息请见：<u><link="docs/unlocks/megafarm.md">Megafarm</link></u>