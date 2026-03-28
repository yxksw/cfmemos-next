# PWA 图标

请在此目录放置 PWA 应用图标，建议尺寸：

- `icon-72x72.png` - 72x72 像素
- `icon-96x96.png` - 96x96 像素
- `icon-128x128.png` - 128x128 像素
- `icon-144x144.png` - 144x144 像素
- `icon-152x152.png` - 152x152 像素
- `icon-192x192.png` - 192x192 像素（必需）
- `icon-384x384.png` - 384x384 像素
- `icon-512x512.png` - 512x512 像素（必需）

图标要求：
- 格式：PNG
- 背景：透明或纯色
- 建议使用应用 Logo 或头像
- 可以使用 [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) 生成

快速生成图标命令：
```bash
npx pwa-asset-generator logo.png icons --icon-only --opaque false
```
