#!/bin/bash

# PWA 图标生成脚本
# 使用 ffmpeg 将 logo.png 转换为各种尺寸的图标

SOURCE_IMAGE="public/logo.png"
OUTPUT_DIR="public/icons"

# 需要的图标尺寸
SIZES=(72 96 128 144 152 192 384 512)

# 检查源文件是否存在
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "错误: 源文件不存在: $SOURCE_IMAGE"
    exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "开始生成 PWA 图标..."
echo "源文件: $SOURCE_IMAGE"
echo "输出目录: $OUTPUT_DIR"
echo ""

# 获取源图片尺寸
SOURCE_WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=s=x:p=0 "$SOURCE_IMAGE" 2>/dev/null || echo "0")
SOURCE_HEIGHT=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=s=x:p=0 "$SOURCE_IMAGE" 2>/dev/null || echo "0")
echo "源图片尺寸: ${SOURCE_WIDTH}x${SOURCE_HEIGHT}"
echo ""

# 生成各种尺寸的图标
for size in "${SIZES[@]}"; do
    output_file="$OUTPUT_DIR/icon-${size}x${size}.png"
    
    echo -n "生成: icon-${size}x${size}.png ... "
    
    # 使用 ffmpeg 生成图标
    # -vf "scale=${size}:${size}:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:transparent" 
    # 保持宽高比，居中，透明背景
    if ffmpeg -y -i "$SOURCE_IMAGE" -vf "scale=${size}:${size}:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:0x00000000" -frames:v 1 "$output_file" 2>/dev/null; then
        echo "✓ 完成"
    else
        echo "✗ 失败"
    fi
done

echo ""
echo "图标生成完成!"
echo "生成的文件:"
ls -lh "$OUTPUT_DIR"/icon-*.png 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
