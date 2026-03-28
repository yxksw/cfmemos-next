"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";

interface TwikooCommentsProps {
  memoId: number;
}

// 声明 Twikoo 类型
declare global {
  interface Window {
    twikoo?: {
      init: (options: {
        envId: string;
        el: string;
        path?: string;
        lang?: string;
      }) => void;
    };
  }
}

export default function TwikooComments({ memoId }: TwikooCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // 如果已经初始化过，不再重复加载
    if (initializedRef.current) return;
    
    const loadTwikoo = async () => {
      // 检查是否已加载 Twikoo
      if (!window.twikoo) {
        // 动态加载 Twikoo 脚本
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/twikoo@1.6.39/dist/twikoo.all.min.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.head.appendChild(script);
        });
      }

      // 初始化 Twikoo
      if (window.twikoo && containerRef.current) {
        window.twikoo.init({
          envId: siteConfig.twikoo.envId,
          el: `#twikoo-container-${memoId}`,
          path: `memo-${memoId}`,
          lang: "zh-CN",
        });
        initializedRef.current = true;
      }
    };

    loadTwikoo().catch((error) => {
      console.error("加载 Twikoo 失败:", error);
    });

    return () => {
      // 清理工作
      initializedRef.current = false;
    };
  }, [memoId]);

  // 如果未配置 Twikoo envId，显示提示
  if (siteConfig.twikoo.envId === "your-twikoo-env-id") {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-[#3d3d3d] rounded-lg">
        评论系统未配置，请在 config/site.ts 中设置 Twikoo 环境 ID
      </div>
    );
  }

  return (
    <div
      id={`twikoo-container-${memoId}`}
      ref={containerRef}
      className="twikoo-comments"
    />
  );
}
