get_companion() 
获取无人机下方植物的偏好伴生植物。

返回一个形式为 (companion_type, (companion_x_position, companion_y_position)) 的元组。

需要 1 tick 执行。

示例：
companion = get_companion()
if companion != None:
    plant_type, (x, y) = companion
    print("Companion:", plant_type, "at", x, ",", y)

更多相关信息请见：<u><link="docs/unlocks/polyculture.md">Polyculture</link></u>