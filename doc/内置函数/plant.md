plant(entity) 
消耗指定 entity 所需的成本，并将其种植在无人机下方。
如果成本资源不足、地块类型错误或下方已有植物，则种植会失败。

如果成功，则返回 True，否则返回 False。

如果成功，需要 200 ticks 执行，否则需要 1 tick。

示例：
plant(Entities.Bush)