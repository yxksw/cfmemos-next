const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = 'public/logo.png';
const outputDir = 'public/icons';
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
    console.log('开始生成 PWA 图标...');
    console.log('源文件:', sourceImage);
    console.log('输出目录:', outputDir);
    console.log('');

    // 检查源文件是否存在
    if (!fs.existsSync(sourceImage)) {
        console.error('错误: 源文件不存在:', sourceImage);
        process.exit(1);
    }

    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const size of sizes) {
        const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

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
            console.log(`✓ icon-${size}x${size}.png (${sizeKB} KB)`);
        } catch (err) {
            console.error(`✗ icon-${size}x${size}.png - ${err.message}`);
        }
    }

    console.log('\n图标生成完成!');
}

generateIcons().catch(err => {
    console.error('生成失败:', err);
    process.exit(1);
});
