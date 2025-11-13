// engine/potato.js
let potatoFramesMeta = null;

export function getPotatoFramesMeta() {
  if (potatoFramesMeta) return potatoFramesMeta;

  const POTATO_SHEET_URL = (typeof window.POTATO_SHEET_URL === 'string' && window.POTATO_SHEET_URL.length)
    ? window.POTATO_SHEET_URL
    : 'asset/image/potato.png';

  const sheetTex = PIXI.BaseTexture.from(POTATO_SHEET_URL);
  const size = 256;
  const frames = [];

  for (let i = 0; i < 4; i++) {
    frames.push(new PIXI.Texture(sheetTex, new PIXI.Rectangle(i * size, 0, size, size)));
  }
  potatoFramesMeta = { frames, size };

  if (!sheetTex.valid) {
    sheetTex.once('update', () => { potatoFramesMeta = null; });
  }
  return potatoFramesMeta;
}
