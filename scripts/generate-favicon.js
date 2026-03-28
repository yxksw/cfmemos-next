const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = 'public/logo.png';
const faviconOutput = 'src/app/favicon.ico';
const vercelSvgOutput = 'public/vercel.svg';

async function generateFavicon() {
    console.log('开始生成 favicon.ico...');
    console.log('源文件:', sourceImage);

    // 检查源文件是否存在
    if (!fs.existsSync(sourceImage)) {
        console.error('错误: 源文件不存在:', sourceImage);
        process.exit(1);
    }

    try {
        // 生成 favicon.ico (包含多种尺寸的 ICO 文件)
        // ICO 文件通常包含 16x16, 32x32, 48x48 等尺寸
        const sizes = [16, 32, 48];
        const buffers = [];

        for (const size of sizes) {
            const buffer = await sharp(sourceImage)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toBuffer();
            buffers.push({ size, buffer });
        }

        // 使用 sharp 直接输出 ICO 格式（sharp 支持 ICO）
        await sharp(sourceImage)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(faviconOutput);

        console.log('✓ favicon.ico 已生成');

        // 同时生成一个 PNG 格式的 favicon 作为备用
        await sharp(sourceImage)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile('src/app/favicon.png');

        console.log('✓ favicon.png 已生成');

    } catch (err) {
        console.error('生成 favicon 失败:', err.message);
        process.exit(1);
    }
}

async function generateVercelSvg() {
    console.log('\n开始生成 vercel.svg...');

    try {
        // 生成一个适合 Vercel 的 SVG（这里我们生成一个 PNG，然后保存为 SVG 引用的格式）
        // 实际上 Vercel 需要的是 SVG 格式，所以我们生成一个 base64 嵌入的 SVG
        const size = 32;
        const buffer = await sharp(sourceImage)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer();

        const base64 = buffer.toString('base64');

        // 创建一个包含 base64 PNG 的 SVG
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <image href="data:image/png;base64,${base64}" width="32" height="32" />
</svg>`;

        fs.writeFileSync(vercelSvgOutput, svgContent);
        console.log('✓ vercel.svg 已生成');

    } catch (err) {
        console.error('生成 vercel.svg 失败:', err.message);
        process.exit(1);
    }
}

async function main() {
    await generateFavicon();
    await generateVercelSvg();
    console.log('\n所有文件生成完成!');
}

main().catch(err => {
    console.error('生成失败:', err);
    process.exit(1);
});
