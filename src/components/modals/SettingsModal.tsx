"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { X, Bell, Sun, Moon, Monitor, LogOut, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: React.ReactNode;
  description: string;
};

export default function SettingsModal({
  isOpen,
  onClose,
  isLoggedIn,
  onLogout,
}: SettingsModalProps) {
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // 加载保存的设置
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }
  }, []);

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("notifications", checked.toString());
  };

  const themeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "浅色模式",
      icon: <Sun className="w-5 h-5" />,
      description: "始终使用浅色主题",
    },
    {
      value: "dark",
      label: "深色模式",
      icon: <Moon className="w-5 h-5" />,
      description: "始终使用深色主题",
    },
    {
      value: "system",
      label: "跟随系统",
      icon: <Monitor className="w-5 h-5" />,
      description: "根据系统设置自动切换",
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center opacity-100 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#2d2d2d] w-[90%] max-w-[360px] rounded-xl shadow-xl overflow-hidden max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#2d2d2d]">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            系统设置
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 设置项 */}
        <div className="p-5 space-y-6">
          {/* 主题设置 */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              外观主题
            </h4>
            <div className="space-y-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "w-full flex items-center p-3 rounded-lg border transition-all",
                    theme === option.value
                      ? "border-[#07c160] bg-[#07c160]/5 dark:bg-[#07c160]/10"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                    theme === option.value
                      ? "bg-[#07c160] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={cn(
                      "font-medium",
                      theme === option.value
                        ? "text-[#07c160]"
                        : "text-gray-800 dark:text-gray-200"
                    )}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  {theme === option.value && (
                    <Check className="w-5 h-5 text-[#07c160]" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
              当前: {resolvedTheme === "dark" ? "深色模式" : "浅色模式"}
              {theme === "system" && " (跟随系统)"}
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* 通知设置 */}
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            label="消息通知"
            description="接收新评论和回复通知"
            checked={notifications}
            onChange={handleNotificationsChange}
          />

          {/* 分隔线 */}
          {isLoggedIn && (
            <div className="border-t border-gray-100 dark:border-gray-700" />
          )}

          {/* 退出登录 */}
          {isLoggedIn && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingItem({ icon, label, description, checked, onChange }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {icon}
        </div>
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-200">
            {label}
          </div>
          {description && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={cn(
            "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#07c160]/20 rounded-full peer",
            "dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
            "after:bg-white after:border-gray-300 after:border after:rounded-full",
            "after:h-5 after:w-5 after:transition-all",
            "peer-checked:bg-[#07c160]"
          )}
        />
      </label>
    </div>
  );
}
