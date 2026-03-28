# PWA 图标生成脚本 (PowerShell)
# 使用 Node.js + sharp 库将 logo.png 转换为各种尺寸的图标

$SOURCE_IMAGE = "public/logo.png"
$OUTPUT_DIR = "public/icons"

# 需要的图标尺寸 (与 manifest.json 对应)
$SIZES = @(72, 96, 128, 144, 152, 192, 384, 512)

# 检查源文件是否存在
if (-not (Test-Path $SOURCE_IMAGE)) {
    Write-Error "错误: 源文件不存在: $SOURCE_IMAGE"
    exit 1
}

# 创建输出目录
if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null
}

Write-Host "开始生成 PWA 图标..." -ForegroundColor Green
Write-Host "源文件: $SOURCE_IMAGE"
Write-Host "输出目录: $OUTPUT_DIR"
Write-Host ""

# 检查是否安装了 sharp
$sharpInstalled = $false
try {
    $null = node -e "require('sharp')" 2>$null
    $sharpInstalled = $true
} catch {
    $sharpInstalled = $false
}

if (-not $sharpInstalled) {
    Write-Host "正在安装 sharp 库..." -ForegroundColor Yellow
    npm install sharp --save-dev
}

# 创建临时 Node.js 脚本
$nodeScript = @"
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = '$SOURCE_IMAGE';
const outputDir = '$OUTPUT_DIR';
const sizes = [$($SIZES -join ', ')];

async function generateIcons() {
    console.log('读取源图片...');
    
    for (const size of sizes) {
        const outputFile = path.join(outputDir, \`icon-\${size}x\${size}.png\`);
        
        try {
            await sharp(sourceImage)
                .resize(size, size, { 
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toFile(outputFile);
            
            const stats = fs.statSync(outputFile);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(\`✓ icon-\${size}x\${size}.png (\${sizeKB} KB)\`);
        } catch (err) {
            console.error(\`✗ icon-\${size}x\${size}.png - \${err.message}\`);
        }
    }
    
    console.log('\\n图标生成完成!');
}

generateIcons().catch(console.error);
"@

$tempScriptPath = "temp-generate-icons.js"
$nodeScript | Out-File -FilePath $tempScriptPath -Encoding UTF8

try {
    node $tempScriptPath
} finally {
    # 清理临时文件
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force
    }
}

Write-Host ""
Write-Host "所有图标已生成到: $OUTPUT_DIR" -ForegroundColor Green
