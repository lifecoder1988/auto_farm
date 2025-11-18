simulate(filename, sim_unlocks, sim_items, sim_globals, seed, speedup)
使用指定的 filename 作为起点，为排行榜开始一次模拟。

sim_unlocks：一个包含起始解锁项的序列。
sim_items：一个将物品映射到数量的字典。模拟将以这些物品开始。
sim_globals：一个将变量名映射到值的字典。模拟开始时，这些变量将存在于全局作用域中。
seed：模拟的随机种子。必须是正整数。
speedup：起始加速倍率。

返回运行模拟所花费的时间。

需要 200 ticks 执行。

示例：
filename = "f1"
sim_unlocks = Unlocks
sim_items = {Items.Carrot : 10000, Items.Hay : 50}
sim_globals = {"a" : 13}
seed = 0
speedup = 64

run_time = simulate(filename, sim_unlocks, sim_items, sim_globals, seed, speedup)

更多相关信息请见：<u><link="docs/unlocks/simulation.md">Simulation</link></u>