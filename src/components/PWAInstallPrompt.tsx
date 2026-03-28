"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function PWAInstallPrompt() {
  // 如果 PWA 被禁用，不渲染组件
  if (!siteConfig.pwa.enabled) {
    return null;
  }
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // 处理安装
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("[PWA] 用户接受安装");
    } else {
      console.log("[PWA] 用户拒绝安装");
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt]);

  // 关闭提示
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  }, []);

  useEffect(() => {
    // 检测是否为 iOS 设备
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                         !("MSStream" in window);
      setIsIOS(isIOSDevice);
      return isIOSDevice;
    };

    // 检测是否已安装（standalone 模式）
    const checkStandalone = () => {
      const nav = navigator as NavigatorWithStandalone;
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
                          nav.standalone === true;
      
      if (isStandalone) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    const isIOSDevice = checkIOS();
    const isStandalone = checkStandalone();

    if (isStandalone) {
      return;
    }

    // 检查用户是否已关闭提示（24小时内不再显示）
    const lastDismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (lastDismissed) {
      const hoursSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    // 监听 appinstalled 事件
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsVisible(false);
      console.log("[PWA] 应用已安装");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 对于 iOS，如果没有安装，延迟显示提示
    let iosTimeout: NodeJS.Timeout;
    if (isIOSDevice && !isStandalone) {
      iosTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (iosTimeout) {
        clearTimeout(iosTimeout);
      }
    };
  }, []);

  // 如果已安装或不显示，返回 null
  if (isInstalled || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[9999]">
      <div className={cn(
        "rounded-xl shadow-lg p-4 transition-all duration-300",
        "bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700"
      )}>
        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-[#07c160]/10"
          )}>
            {isIOS ? (
              <Smartphone className="w-6 h-6 text-[#07c160]" />
            ) : (
              <Download className="w-6 h-6 text-[#07c160]" />
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1 pr-6">
            <h3 className={cn(
              "font-semibold text-base mb-1",
              "text-gray-900 dark:text-gray-100"
            )}>
              安装应用到主屏幕
            </h3>
            <p className={cn(
              "text-sm mb-3",
              "text-gray-500 dark:text-gray-400"
            )}>
              {isIOS 
                ? '点击 Safari 底部的分享按钮，然后选择"添加到主屏幕"'
                : "安装后可离线访问，获得更好的体验"
              }
            </p>

            {/* 操作按钮 */}
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full py-2.5 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg text-sm font-medium transition-colors"
              >
                立即安装
              </button>
            )}

            {/* iOS 安装说明 */}
            {isIOS && (
              <div className={cn(
                "text-xs p-3 rounded-lg",
                "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}>
                <p className="mb-1">1. 点击 Safari 底部中间的分享按钮</p>
                <p>2. 向上滑动，选择&quot;添加到主屏幕&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
