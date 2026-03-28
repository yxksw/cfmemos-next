import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 图片优化配置
  images: {
    unoptimized: true,
  },

  // SSR 模式 - 不使用静态导出
  // output: "export", // 注释掉静态导出

  // 尾部斜杠配置
  trailingSlash: true,

  // 开发配置
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
