import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 图片优化配置
  images: {
    unoptimized: true,
  },

  // 输出配置 - 仅在生产构建时使用静态导出
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  distDir: "dist",

  // 尾部斜杠配置
  trailingSlash: true,

  // 开发配置
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
