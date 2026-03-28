"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Users, Sun, Moon, Monitor, PenSquare, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { logoutUser } from "@/lib/api";

interface HeaderProps {
  onFriendsClick?: () => void;
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Header({
  onFriendsClick,
  onLoginClick,
  isLoggedIn = false,
  onLogout,
}: HeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { resolvedTheme, toggleTheme, theme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 获取主题图标
  const getThemeIcon = () => {
    if (theme === "system") {
      return <Monitor className="w-full h-full" strokeWidth={2} />;
    }
    return isDark ? (
      <Moon className="w-full h-full" strokeWidth={2} />
    ) : (
      <Sun className="w-full h-full" strokeWidth={2} />
    );
  };

  // 获取主题提示文字
  const getThemeTitle = () => {
    if (theme === "system") return "跟随系统";
    return isDark ? "深色模式" : "浅色模式";
  };

  // 跳转到写说说页面
  const handlePostClick = () => {
    router.push("/post");
  };

  // 处理登出
  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      await logoutUser(token);
    }
    localStorage.removeItem("auth_token");
    onLogout?.();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[576px] h-[50px] flex justify-between items-center px-5 z-50 transition-all duration-300 rounded-b-lg",
        isScrolled
          ? "bg-white/95 dark:bg-[#2d2d2d]/95 shadow-md backdrop-blur-sm"
          : "bg-transparent"
      )}
    >
      {/* 左侧图标 */}
      <div className="flex items-center gap-5">
        {/* 友链 */}
        <button
          onClick={onFriendsClick}
          className={cn(
            "w-6 h-6 transition-all duration-300 hover:scale-110",
            isScrolled
              ? "text-gray-800 dark:text-gray-200"
              : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
          )}
          title="我的朋友"
        >
          <Users className="w-full h-full" strokeWidth={2} />
        </button>

        {/* 主题切换 */}
        <button
          onClick={toggleTheme}
          className={cn(
            "w-6 h-6 transition-all duration-300 hover:scale-110",
            isScrolled
              ? "text-gray-800 dark:text-gray-200"
              : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
          )}
          title={`切换主题 (${getThemeTitle()})`}
        >
          {getThemeIcon()}
        </button>
      </div>

      {/* 右侧图标 */}
      <div className="flex items-center gap-5">
        {/* 写说说 - 仅登录且 TOKEN 匹配时显示 */}
        {isLoggedIn && (
          <button
            onClick={handlePostClick}
            className={cn(
              "w-6 h-6 transition-all duration-300 hover:scale-110",
              isScrolled
                ? "text-gray-800 dark:text-gray-200"
                : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
            )}
            title="写说说"
          >
            <PenSquare className="w-full h-full" strokeWidth={2} />
          </button>
        )}

        {/* 登录/登出 */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className={cn(
              "w-6 h-6 transition-all duration-300 hover:scale-110",
              isScrolled
                ? "text-gray-800 dark:text-gray-200"
                : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
            )}
            title="登出"
          >
            <LogOut className="w-full h-full" strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className={cn(
              "w-6 h-6 transition-all duration-300 hover:scale-110",
              isScrolled
                ? "text-gray-800 dark:text-gray-200"
                : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
            )}
            title="登录"
          >
            <User className="w-full h-full" strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
