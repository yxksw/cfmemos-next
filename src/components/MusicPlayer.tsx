"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { MusicSong } from "@/types/memo";
import { cn } from "@/lib/utils";

export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState<MusicSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLyric, setCurrentLyric] = useState("");
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // 加载歌单
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const response = await fetch(siteConfig.music.api);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPlaylist(data);
          // 随机播放
          const randomIndex = Math.floor(Math.random() * data.length);
          setCurrentIndex(randomIndex);
        }
      } catch (error) {
        console.error("加载音乐列表失败:", error);
      }
    };

    if (siteConfig.music.enabled) {
      loadPlaylist();
    }
  }, []);

  const currentSong = playlist[currentIndex];

  // 加载歌词
  const loadLyrics = useCallback(async (lrcUrl?: string) => {
    if (!lrcUrl) {
      setLyrics([]);
      return;
    }
    
    try {
      const response = await fetch(lrcUrl);
      const lrc = await response.text();
      const parsedLyrics = parseLyric(lrc);
      setLyrics(parsedLyrics);
    } catch {
      setLyrics([]);
    }
  }, []);

  // 解析歌词
  const parseLyric = (lrc: string): { time: number; text: string }[] => {
    const lines = lrc.split("\n");
    const lyrics: { time: number; text: string }[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach((line) => {
      const match = line.match(timeRegex);
      if (match) {
        const min = parseInt(match[1]);
        const sec = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = min * 60 + sec + ms / 1000;
        const text = line.replace(timeRegex, "").trim();
        if (text) {
          lyrics.push({ time, text });
        }
      }
    });

    return lyrics;
  };

  // 更新歌词
  const updateLyric = useCallback((currentTime: number) => {
    if (lyrics.length === 0) return;
    
    let currentLyricText = "";
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        currentLyricText = lyrics[i].text;
      } else {
        break;
      }
    }
    setCurrentLyric(currentLyricText);
  }, [lyrics]);

  // 切换歌曲时加载歌词
  useEffect(() => {
    if (currentSong?.lrc) {
      loadLyrics(currentSong.lrc);
    } else {
      setLyrics([]);
      setCurrentLyric("");
    }
  }, [currentSong, loadLyrics]);

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 下一首
  const nextSong = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  // 时间更新
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    const { currentTime, duration } = audioRef.current;
    if (duration) {
      setProgress((currentTime / duration) * 100);
      updateLyric(currentTime);
    }
  };

  // 歌曲结束
  const handleEnded = () => {
    nextSong();
  };

  // 点击进度条
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  if (!siteConfig.music.enabled || playlist.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-5 left-5 z-[9999] bg-white/95 dark:bg-[#2d2d2d]/95 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 overflow-hidden",
        isExpanded ? "max-w-[280px] rounded-2xl" : "max-w-[280px]"
      )}
    >
      <div className="flex items-center p-2 gap-2.5">
        {/* 封面 */}
        <div
          className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer group"
          onClick={togglePlay}
        >
          <img
            src={currentSong?.pic || "https://via.placeholder.com/40"}
            alt="封面"
            className={cn(
              "w-full h-full object-cover transition-transform",
              isPlaying && "animate-spin",
              isPlaying && "[animation-duration:10s]"
            )}
            style={{ animationTimingFunction: "linear", animationIterationCount: "infinite" }}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </div>
        </div>

        {/* 歌曲信息 */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
            {currentSong?.title || "未知歌曲"}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {currentSong?.author || "未知艺术家"}
          </div>
        </div>
      </div>

      {/* 歌词区域 */}
      <div
        className={cn(
          "max-h-0 overflow-hidden transition-all duration-300 text-center",
          isExpanded && "max-h-[60px] py-2 px-3"
        )}
      >
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {currentLyric || "..."}
        </div>
      </div>

      {/* 进度条 */}
      <div
        className="h-[3px] bg-black/10 dark:bg-white/10 cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-[#07c160] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={currentSong?.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="none"
      />
    </div>
  );
}
