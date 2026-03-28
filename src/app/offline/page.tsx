"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // 检测深色模式
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };
    checkDarkMode();

    // 监听深色模式变化
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 检测网络状态
    const handleOnline = () => {
      setIsOnline(true);
      // 自动刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      observer.disconnect();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      alert("您仍处于离线状态，请检查网络连接");
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300",
        isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
      )}
    >
      <div
        className={cn(
          "max-w-md w-full text-center p-8 rounded-2xl shadow-lg transition-colors duration-300",
          isDark ? "bg-[#2d2d2d]" : "bg-white"
        )}
      >
        {/* 离线图标 */}
        <div className="mb-6">
          <div
            className={cn(
              "w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-colors duration-300",
              isDark ? "bg-gray-700" : "bg-gray-100"
            )}
          >
            {isOnline ? (
              <RefreshCw className="w-12 h-12 text-[#07c160] animate-spin" />
            ) : (
              <WifiOff
                className={cn(
                  "w-12 h-12 transition-colors duration-300",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              />
            )}
          </div>
        </div>

        {/* 标题 */}
        <h1
          className={cn(
            "text-2xl font-bold mb-3 transition-colors duration-300",
            isDark ? "text-gray-100" : "text-gray-800"
          )}
        >
          {isOnline ? "网络已恢复" : "您已离线"}
        </h1>

        {/* 描述 */}
        <p
          className={cn(
            "text-base mb-8 transition-colors duration-300",
            isDark ? "text-gray-400" : "text-gray-500"
          )}
        >
          {isOnline
            ? "正在为您重新加载页面..."
            : "请检查您的网络连接，或稍后再试。已缓存的内容仍可正常浏览。"}
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300",
              isDark
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <Home className="w-5 h-5" />
            返回首页
          </button>

          {!isOnline && (
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-[#07c160] hover:bg-[#06ad56] text-white transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              重新加载
            </button>
          )}
        </div>

        {/* 提示信息 */}
        <div
          className={cn(
            "mt-8 pt-6 border-t text-sm transition-colors duration-300",
            isDark
              ? "border-gray-700 text-gray-500"
              : "border-gray-200 text-gray-400"
          )}
        >
          <p>提示：离线时您可以浏览已缓存的说说内容</p>
        </div>
      </div>

      {/* 底部品牌 */}
      <div
        className={cn(
          "mt-8 text-sm transition-colors duration-300",
          isDark ? "text-gray-500" : "text-gray-400"
        )}
      >
        异飨客的朋友圈
      </div>
    </div>
  );
}
