export const DEFAULT_CODE  = `
// 支持的方法（API）：
// move(dir) // 'up'|'down'|'left'|'right'
// plant(type) // '土豆'|'南瓜'
// harvest()
// canHarvest()
// spawn(async ({ move, plant, harvest }) => { /* ... */ })
// changeCharacter(type)
// getPosition()
// getWorldSize()
// setWorldSize(size)
// createMaze(size)
//
// 下面是运行示例：

move('right')
move('right')
plant('土豆')
move('down')
harvest()
`;

