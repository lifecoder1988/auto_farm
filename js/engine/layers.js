// engine/layers.js
export let soilLayer;
export let gridLayer;
export let cropsLayer;
export let entitiesLayer;

export function initLayers(app) {
  soilLayer = new PIXI.Container();
  gridLayer = new PIXI.Graphics();
  cropsLayer = new PIXI.Container();
  entitiesLayer = new PIXI.Container();

  app.stage.addChild(soilLayer);
  app.stage.addChild(gridLayer);
  app.stage.addChild(cropsLayer);
  app.stage.addChild(entitiesLayer);

  return { soilLayer, gridLayer, cropsLayer, entitiesLayer };
}
