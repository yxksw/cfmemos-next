"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Users, Sun, Moon, Monitor, PenSquare, User, LogOut, Play, Pause, Music2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { logoutUser } from "@/lib/api";

// 用于检测客户端挂载的 hook
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// 用于获取 localStorage 中 token 的 hook
function useAuthToken() {
  return useSyncExternalStore(
    (callback) => {
      const handleStorage = () => callback();
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    () => !!localStorage.getItem("auth_token"),
    () => false
  );
}

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { resolvedTheme, toggleTheme, theme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMounted = useIsMounted();
  const isLoggedIn = useAuthToken();

  // 处理音乐链接
  const getAudioSrc = () => {
    if (typeof window === 'undefined') return "";
    const musicUrl = siteConfig.newMusicPlayer.musicUrl;
    if (!musicUrl) return "";
    // 如果是纯数字，认为是网易云音乐ID
    if (/^\d+$/.test(musicUrl)) {
      // 使用多个备用解析服务
      const nId = musicUrl;
      // 尝试不同的解析服务
      const apis = [
        `https://music.163.com/song/media/outer/url?id=${nId}.mp3`,
        `https://api.injahow.cn/meting/?id=${nId}&type=url`,
      ];
      return apis[0]; // 使用第一个，如果失败会在错误处理中尝试其他
    }
    return musicUrl;
  };

  const [audioSrc, setAudioSrc] = useState("");
  const [apiIndex, setApiIndex] = useState(0);
  
  useEffect(() => {
    if (isMounted) {
      setAudioSrc(getAudioSrc());
    }
  }, [isMounted]);

  // 获取备用API
  const getBackupAudioSrc = () => {
    if (typeof window === 'undefined') return "";
    const musicUrl = siteConfig.newMusicPlayer.musicUrl;
    if (!musicUrl || !/^\d+$/.test(musicUrl)) return "";
    
    const nId = musicUrl;
    const apis = [
      `https://music.163.com/song/media/outer/url?id=${nId}.mp3`,
      `https://api.injahow.cn/meting/?id=${nId}&type=url`,
    ];
    
    const nextIndex = (apiIndex + 1) % apis.length;
    setApiIndex(nextIndex);
    return apis[nextIndex];
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    // 触发 storage 事件来更新登录状态
    window.dispatchEvent(new StorageEvent("storage"));
    router.refresh();
  };

  // 处理登录点击
  const handleLoginClick = () => {
    // 触发登录模态框事件
    window.dispatchEvent(new CustomEvent('open-login-modal'));
  };

  // 处理友链点击
  const handleFriendsClick = () => {
    window.dispatchEvent(new CustomEvent('open-friends-modal'));
  };

  // 处理搜索点击
  const handleSearchClick = () => {
    window.dispatchEvent(new CustomEvent('open-search-modal'));
  };

  // 切换播放/暂停
  const togglePlay = async () => {
    if (!audioRef.current || !audioSrc) {
      console.error("音频未准备好");
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setShowAnimation(false);
      setIsPlaying(false);
    } else {
      try {
        // 如果音频出错，重新加载
        if (audioRef.current.error) {
          audioRef.current.load();
        }
        await audioRef.current.play();
        setShowAnimation(true);
        setIsPlaying(true);
      } catch (error) {
        console.error("播放失败:", error);
        alert("音乐播放失败，请检查网络连接或音乐链接是否有效");
      }
    }
  };

  // 监听音频事件
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setShowAnimation(false);
    };

    const handleError = () => {
      console.error("音频加载错误，尝试备用API...");
      // 尝试备用API
      const backupSrc = getBackupAudioSrc();
      if (backupSrc && backupSrc !== audioSrc) {
        console.log("切换到备用API:", backupSrc);
        setAudioSrc(backupSrc);
        // 延迟后重试播放
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().catch(() => {
              console.error("备用API也失败");
              setIsPlaying(false);
              setShowAnimation(false);
            });
          }
        }, 100);
      } else {
        setIsPlaying(false);
        setShowAnimation(false);
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError as EventListener);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError as EventListener);
    };
  }, []);

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
      <div className="flex items-center gap-2 sm:gap-5">
        {/* 友链 */}
        <button
          onClick={handleFriendsClick}
          className={cn(
            "transition-all duration-300 hover:scale-110",
            isScrolled
              ? "text-gray-800 dark:text-gray-200"
              : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
          )}
          title="我的朋友"
        >
          <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
        </button>

        {/* 主题切换 */}
        <button
          onClick={toggleTheme}
          className={cn(
            "transition-all duration-300 hover:scale-110",
            isScrolled
              ? "text-gray-800 dark:text-gray-200"
              : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
          )}
          title={`切换主题 (${getThemeTitle()})`}
        >
          {theme === "system" ? (
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          ) : isDark ? (
            <Moon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          ) : (
            <Sun className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          )}
        </button>

        {/* 音乐播放器按钮 - 只在客户端挂载后显示 */}
        {isMounted && siteConfig.newMusicPlayer.enabled && audioSrc && (
          <button
            onClick={togglePlay}
            className={cn(
              "transition-all duration-300 hover:scale-110 relative",
              isScrolled
                ? "text-gray-800 dark:text-gray-200"
                : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
            )}
            title={isPlaying ? "暂停音乐" : "播放音乐"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            ) : (
              <Music2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            )}
            {/* 播放动画指示器 */}
            {showAnimation && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#07c160] rounded-full animate-pulse" />
            )}
          </button>
        )}

        {/* 隐藏音频元素 - 只在客户端挂载后渲染 */}
        {isMounted && siteConfig.newMusicPlayer.enabled && audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            preload="metadata"
            className="hidden"
          />
        )}
      </div>

      {/* 右侧图标 */}
      <div className="flex items-center gap-2 sm:gap-5">
        {/* 搜索 */}
        <button
          onClick={handleSearchClick}
          className={cn(
            "transition-all duration-300 hover:scale-110",
            isScrolled
              ? "text-gray-800 dark:text-gray-200"
              : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
          )}
          title="搜索"
        >
          <Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
        </button>

        {/* 写说说 - 仅登录时显示 */}
        {isLoggedIn && (
          <button
            onClick={handlePostClick}
            className={cn(
              "transition-all duration-300 hover:scale-110",
              isScrolled
                ? "text-gray-800 dark:text-gray-200"
                : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
            )}
            title="写说说"
          >
            <PenSquare className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </button>
        )}

        {/* 登录/登出 */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className={cn(
              "transition-all duration-300 hover:scale-110",
              isScrolled
                ? "text-gray-800 dark:text-gray-200"
                : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
            )}
            title="登出"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={handleLoginClick}
            className={cn(
              "transition-all duration-300 hover:scale-110",
              isScrolled
                ? "text-gray-800 dark:text-gray-200"
                : "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
            )}
            title="登录"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
