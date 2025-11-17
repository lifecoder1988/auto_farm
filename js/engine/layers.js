// engine/layers.js
export let soilLayer;
export let gridLayer;
export let cropsLayer;
export let entitiesLayer;
export let mazeLayer;
export let debugLayer;
export function initLayers(app) {
  soilLayer = new PIXI.Container();
  gridLayer = new PIXI.Graphics();
  cropsLayer = new PIXI.Container();
  entitiesLayer = new PIXI.Container();
  mazeLayer = new PIXI.Container();
  debugLayer = new PIXI.Graphics();

  app.stage.addChild(soilLayer);
  app.stage.addChild(gridLayer);
  app.stage.addChild(cropsLayer);
  app.stage.addChild(entitiesLayer);
  app.stage.addChild(mazeLayer);
  app.stage.addChild(debugLayer);

  return { soilLayer, gridLayer, cropsLayer, entitiesLayer, mazeLayer, debugLayer };
}
