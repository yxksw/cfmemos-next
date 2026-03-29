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
        theme?: string;
        colorScheme?: string;
        customCss?: string;
      }) => void;
    };
  }
}

// 添加全局样式函数 - 移到组件外部
function addGlobalStyles() {
  // 检查是否已存在样式
  if (typeof document === 'undefined' || document.getElementById('twikoo-custom-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'twikoo-custom-styles';
  style.textContent = `
    /* 全局 Twikoo 样式覆盖 */
    .twikoo-comments {
      --tk-color-primary: #07C160 !important;
      --tk-color-text: #333 !important;
      --tk-color-text-secondary: #999 !important;
      --tk-color-border: #e0e0e0 !important;
      --tk-color-background: #ffffff !important;
      --tk-color-background-secondary: #f9f9f9 !important;
    }
    
    .dark .twikoo-comments {
      --tk-color-primary: #07C160 !important;
      --tk-color-text: #e0e0e0 !important;
      --tk-color-text-secondary: #888 !important;
      --tk-color-border: #404040 !important;
      --tk-color-background: #2d2d2d !important;
      --tk-color-background-secondary: #3d3d3d !important;
    }
    
    /* 强制覆盖 Twikoo 样式 */
    .twikoo-comments .tk-comment-form {
      border: 1px solid #07C160 !important;
      border-radius: 8px !important;
      padding: 20px !important;
      background-color: #ffffff !important;
      margin-top: 16px !important;
      box-shadow: none !important;
    }
    
    .twikoo-comments .tk-comment-form h3 {
      color: #07C160 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      margin-bottom: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    
    .twikoo-comments .tk-meta-input {
      display: flex !important;
      gap: 10px !important;
      margin-bottom: 15px !important;
      flex-wrap: wrap !important;
    }
    
    .twikoo-comments .tk-meta-input input {
      flex: 1 !important;
      min-width: 120px !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      padding: 8px 12px !important;
      font-size: 14px !important;
      background-color: #ffffff !important;
      color: #333 !important;
    }
    
    .twikoo-comments .tk-content-input {
      margin-bottom: 15px !important;
    }
    
    .twikoo-comments .tk-textarea {
      width: 100% !important;
      min-height: 100px !important;
      resize: vertical !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      padding: 10px 12px !important;
      font-size: 14px !important;
      background-color: #ffffff !important;
      color: #333 !important;
    }
    
    .twikoo-comments .tk-row {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-top: 15px !important;
    }
    
    .twikoo-comments .tk-emoji-btn {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      padding: 6px 12px !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      background-color: #ffffff !important;
      color: #666 !important;
      cursor: pointer !important;
      font-size: 14px !important;
    }
    
    .twikoo-comments .tk-submit-area {
      display: flex !important;
      gap: 12px !important;
    }
    
    .twikoo-comments .tk-submit {
      background-color: #07C160 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 8px 20px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    }
    
    .twikoo-comments .tk-cancel {
      background-color: #f0f0f0 !important;
      color: #666 !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      padding: 8px 20px !important;
      font-size: 14px !important;
      cursor: pointer !important;
    }
    
    .twikoo-comments .tk-comment {
      padding: 16px 0 !important;
      border-bottom: 1px solid #f0f0f0 !important;
    }
    
    .twikoo-comments .tk-avatar {
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      margin-right: 10px !important;
    }
    
    .twikoo-comments .tk-content {
      font-size: 14px !important;
      line-height: 1.6 !important;
      margin-top: 8px !important;
      color: #333 !important;
    }
    
    .twikoo-comments .tk-meta {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      margin-bottom: 8px !important;
    }
    
    .twikoo-comments .tk-nick {
      font-weight: 500 !important;
      color: #576b95 !important;
      font-size: 14px !important;
    }
    
    .twikoo-comments .tk-time {
      font-size: 12px !important;
      color: #999 !important;
    }
    
    .twikoo-comments .tk-action {
      display: flex !important;
      gap: 16px !important;
      margin-top: 8px !important;
      font-size: 12px !important;
      color: #999 !important;
    }
    
    .twikoo-comments .tk-action a {
      color: #999 !important;
    }
    
    /* 深色模式 */
    .dark .twikoo-comments .tk-comment-form {
      border-color: #07C160 !important;
      background-color: #2d2d2d !important;
    }
    
    .dark .twikoo-comments .tk-meta-input input {
      background-color: #3d3d3d !important;
      color: #e0e0e0 !important;
      border-color: #404040 !important;
    }
    
    .dark .twikoo-comments .tk-textarea {
      background-color: #3d3d3d !important;
      color: #e0e0e0 !important;
      border-color: #404040 !important;
    }
    
    .dark .twikoo-comments .tk-emoji-btn {
      background-color: #3d3d3d !important;
      border-color: #404040 !important;
      color: #b0b0b0 !important;
    }
    
    .dark .twikoo-comments .tk-cancel {
      background-color: #3d3d3d !important;
      border-color: #404040 !important;
      color: #b0b0b0 !important;
    }
    
    .dark .twikoo-comments .tk-comment {
      border-bottom-color: #404040 !important;
    }
    
    .dark .twikoo-comments .tk-content {
      color: #e0e0e0 !important;
    }
    
    .dark .twikoo-comments .tk-nick {
      color: #6ab3ff !important;
    }
    
    .dark .twikoo-comments .tk-time {
      color: #888 !important;
    }
  `;
  document.head.appendChild(style);
}

export default function TwikooComments({ memoId }: TwikooCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // 如果已经初始化过，不再重复加载
    if (initializedRef.current) return;
    
    const loadTwikoo = async () => {
      // 先添加全局样式
      addGlobalStyles();
      
      // 检查是否已加载 Twikoo
      if (!window.twikoo) {
        // 动态加载 Twikoo 脚本
        const script = document.createElement("script");
        script.src = "https://cdn.jsdmirror.cn/npm/twikoo@1.7.4/dist/twikoo.min.js";
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
          // 配置 Twikoo 样式
          theme: "light",
          colorScheme: "light",
          // 自定义样式
          customCss: `
            /* 强制覆盖样式 */
            .tk-comment-form {
              border: 1px solid #07C160 !important;
              border-radius: 8px !important;
              padding: 20px !important;
              background-color: #ffffff !important;
              margin-top: 16px !important;
              box-shadow: none !important;
            }
            .tk-comment-form h3 {
              color: #07C160 !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              margin-bottom: 16px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
            }
            .tk-meta-input {
              display: flex !important;
              gap: 10px !important;
              margin-bottom: 15px !important;
              flex-wrap: wrap !important;
            }
            .tk-meta-input input {
              flex: 1 !important;
              min-width: 120px !important;
              border: 1px solid #e0e0e0 !important;
              border-radius: 4px !important;
              padding: 8px 12px !important;
              font-size: 14px !important;
              background-color: #ffffff !important;
              color: #333 !important;
            }
            .tk-content-input {
              margin-bottom: 15px !important;
            }
            .tk-textarea {
              width: 100% !important;
              min-height: 100px !important;
              resize: vertical !important;
              border: 1px solid #e0e0e0 !important;
              border-radius: 4px !important;
              padding: 10px 12px !important;
              font-size: 14px !important;
              background-color: #ffffff !important;
              color: #333 !important;
            }
            .tk-row {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              margin-top: 15px !important;
            }
            .tk-emoji-btn {
              display: flex !important;
              align-items: center !important;
              gap: 4px !important;
              padding: 6px 12px !important;
              border: 1px solid #e0e0e0 !important;
              border-radius: 4px !important;
              background-color: #ffffff !important;
              color: #666 !important;
              cursor: pointer !important;
              font-size: 14px !important;
            }
            .tk-submit-area {
              display: flex !important;
              gap: 12px !important;
            }
            .tk-submit {
              background-color: #07C160 !important;
              color: white !important;
              border: none !important;
              border-radius: 4px !important;
              padding: 8px 20px !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
            }
            .tk-cancel {
              background-color: #f0f0f0 !important;
              color: #666 !important;
              border: 1px solid #e0e0e0 !important;
              border-radius: 4px !important;
              padding: 8px 20px !important;
              font-size: 14px !important;
              cursor: pointer !important;
            }
            .tk-comment {
              padding: 16px 0 !important;
              border-bottom: 1px solid #f0f0f0 !important;
            }
            .tk-avatar {
              width: 36px !important;
              height: 36px !important;
              border-radius: 50% !important;
              margin-right: 10px !important;
            }
            .tk-content {
              font-size: 14px !important;
              line-height: 1.6 !important;
              margin-top: 8px !important;
              color: #333 !important;
            }
            .tk-meta {
              display: flex !important;
              align-items: center !important;
              gap: 10px !important;
              margin-bottom: 8px !important;
            }
            .tk-nick {
              font-weight: 500 !important;
              color: #576b95 !important;
              font-size: 14px !important;
            }
            .tk-time {
              font-size: 12px !important;
              color: #999 !important;
            }
            .tk-action {
              display: flex !important;
              gap: 16px !important;
              margin-top: 8px !important;
              font-size: 12px !important;
              color: #999 !important;
            }
            .tk-action a {
              color: #999 !important;
            }
            /* 深色模式 */
            .dark .tk-comment-form {
              border-color: #07C160 !important;
              background-color: #2d2d2d !important;
            }
            .dark .tk-meta-input input {
              background-color: #3d3d3d !important;
              color: #e0e0e0 !important;
              border-color: #404040 !important;
            }
            .dark .tk-textarea {
              background-color: #3d3d3d !important;
              color: #e0e0e0 !important;
              border-color: #404040 !important;
            }
            .dark .tk-emoji-btn {
              background-color: #3d3d3d !important;
              border-color: #404040 !important;
              color: #b0b0b0 !important;
            }
            .dark .tk-cancel {
              background-color: #3d3d3d !important;
              border-color: #404040 !important;
              color: #b0b0b0 !important;
            }
            .dark .tk-comment {
              border-bottom-color: #404040 !important;
            }
            .dark .tk-content {
              color: #e0e0e0 !important;
            }
            .dark .tk-nick {
              color: #6ab3ff !important;
            }
            .dark .tk-time {
              color: #888 !important;
            }
          `
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
    <div className="w-full overflow-hidden">
      <div
        id={`twikoo-container-${memoId}`}
        ref={containerRef}
        className="twikoo-comments"
        data-theme="light"
      />
    </div>
  );
}
