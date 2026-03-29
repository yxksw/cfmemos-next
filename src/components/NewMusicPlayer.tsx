"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewMusicPlayerProps {
  musicUrl?: string; // 音乐链接或网易云音乐ID
}

export default function NewMusicPlayer({ musicUrl }: NewMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 处理音乐链接
  const getAudioSrc = () => {
    if (!musicUrl) return "";
    // 如果是纯数字，认为是网易云音乐ID
    if (/^\d+$/.test(musicUrl)) {
      return `//music.163.com/song/media/outer/url?id=${musicUrl}.mp3`;
    }
    return musicUrl;
  };

  const audioSrc = getAudioSrc();

  // 切换播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setShowAnimation(false);
    } else {
      audioRef.current.play();
      setShowAnimation(true);
    }
    setIsPlaying(!isPlaying);
  };

  // 监听音频结束
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setShowAnimation(false);
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  if (!audioSrc) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 bg-white/90 dark:bg-[#2d2d2d]/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* 音乐图标 */}
        <div className="w-8 h-8 rounded-full bg-[#07c160] flex items-center justify-center">
          <Music2 className="w-4 h-4 text-white" />
        </div>

        {/* 音乐动画 */}
        {showAnimation && (
          <div className="flex items-end gap-0.5 h-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#07c160] rounded-full animate-music-bar"
                style={{
                  height: "100%",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* 播放/暂停按钮 */}
        <button
          onClick={togglePlay}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            isPlaying
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#07c160] hover:bg-[#06ad56]"
          )}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>

        {/* 隐藏音频元素 */}
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          className="hidden"
        />
      </div>
    </div>
  );
}
