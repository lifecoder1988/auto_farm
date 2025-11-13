import os
import sys
from PIL import Image

TARGET_SIZE = (256, 256)  # 每帧大小固定为 256×256


def main():
    if len(sys.argv) < 3:
        print("用法: python sprite.py <图片目录> <输出文件名>")
        print("示例: python sprite.py ./images sprite.png")
        return

    input_dir = sys.argv[1]
    output_file = sys.argv[2]

    if not os.path.isdir(input_dir):
        print(f"❌ 目录不存在: {input_dir}")
        return

    # 找 PNG 文件
    files = sorted([
        f for f in os.listdir(input_dir)
        if f.lower().endswith(".png")
    ])

    if not files:
        print("❌ 目录下没有 PNG 文件")
        return

    print(f"找到 {len(files)} 张 PNG，开始缩放并拼接...")

    # 读取 & 缩放
    frames = []
    for filename in files:
        path = os.path.join(input_dir, filename)
        img = Image.open(path).convert("RGBA")
        img = img.resize(TARGET_SIZE, Image.LANCZOS)
        frames.append(img)

    N = len(frames)
    sprite_width = TARGET_SIZE[0] * N
    sprite_height = TARGET_SIZE[1]

    # 创建雪碧图
    sprite = Image.new("RGBA", (sprite_width, sprite_height), (0, 0, 0, 0))

    for i, frame in enumerate(frames):
        sprite.paste(frame, (i * TARGET_SIZE[0], 0))

    sprite.save(output_file)
    print(f"✅ 雪碧图已生成: {output_file}")
    print(f"🧩 尺寸: {sprite_width} × {sprite_height}  ({N} 帧)")


if __name__ == "__main__":
    main()
