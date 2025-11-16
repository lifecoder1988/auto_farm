// engine/snake/snakeTextures.js

export function makeSnakeTextures(onReady) {
  const base = PIXI.BaseTexture.from('asset/image/snake.png');
  const appleTex = PIXI.Texture.from('asset/image/apple.png'); // 🍎 新增苹果

  const textures = {
    head: null,
    body: null,
    tail: null,
    apple: null,
    ready: false,

    // 内部统计加载情况
    _loadCount: 0,
    _need: 2  // baseTexture + appleTex
  };

  function done() {
    textures._loadCount++;
    if (textures._loadCount >= textures._need) {
      textures.ready = true;
      onReady && onReady(textures);
    }
  }

  // -----------------------------
  // 1️⃣  加载蛇的贴图 snake.png
  // -----------------------------
  base.on("loaded", () => {
    const frameW = base.width / 3;
    const frameH = base.height;

    textures.head = new PIXI.Texture(base, new PIXI.Rectangle(0, 0, frameW, frameH));
    textures.body = new PIXI.Texture(base, new PIXI.Rectangle(frameW, 0, frameW, frameH));
    textures.tail = new PIXI.Texture(base, new PIXI.Rectangle(frameW * 2, 0, frameW, frameH));

    done();
  });

  // -----------------------------
  // 2️⃣  加载苹果 apple.png
  // -----------------------------
  if (appleTex.baseTexture.valid) {
    // 已经在缓存
    textures.apple = appleTex;
    done();
  } else {
    appleTex.baseTexture.on("loaded", () => {
      textures.apple = appleTex;
      done();
    });
  }

  return textures;
}
