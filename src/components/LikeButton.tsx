"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

// 本地存储点赞数据（当 API 不可用时使用）
const STORAGE_KEY = 'cfmemos-likes';

interface LikeRecord {
  memoId: number;
  userFingerprint: string;
  createdAt: string;
}

// 获取用户指纹
function getUserFingerprint(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const userAgent = navigator.userAgent || '';
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// 从本地存储获取点赞数据
function getLocalLikeData(memoId: number): { count: number; hasLiked: boolean } {
  if (typeof window === 'undefined') return { count: 0, hasLiked: false };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const likes: LikeRecord[] = data ? JSON.parse(data) : [];
    const userFingerprint = getUserFingerprint();
    const count = likes.filter(like => like.memoId === memoId).length;
    const hasLiked = likes.some(like => like.memoId === memoId && like.userFingerprint === userFingerprint);
    return { count, hasLiked };
  } catch {
    return { count: 0, hasLiked: false };
  }
}

// 保存点赞到本地存储
function saveLocalLike(memoId: number): { count: number; hasLiked: boolean } {
  if (typeof window === 'undefined') return { count: 0, hasLiked: false };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const likes: LikeRecord[] = data ? JSON.parse(data) : [];
    const userFingerprint = getUserFingerprint();
    
    // 检查是否已点赞
    const hasLiked = likes.some(like => like.memoId === memoId && like.userFingerprint === userFingerprint);
    if (hasLiked) {
      const count = likes.filter(like => like.memoId === memoId).length;
      return { count, hasLiked: true };
    }
    
    // 添加点赞
    likes.push({
      memoId,
      userFingerprint,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
    
    const count = likes.filter(like => like.memoId === memoId).length;
    return { count, hasLiked: true };
  } catch {
    return { count: 0, hasLiked: false };
  }
}

// 取消本地存储的点赞
function removeLocalLike(memoId: number): { count: number; hasLiked: boolean } {
  if (typeof window === 'undefined') return { count: 0, hasLiked: false };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let likes: LikeRecord[] = data ? JSON.parse(data) : [];
    const userFingerprint = getUserFingerprint();
    
    // 移除点赞
    likes = likes.filter(like => !(like.memoId === memoId && like.userFingerprint === userFingerprint));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
    
    const count = likes.filter(like => like.memoId === memoId).length;
    return { count, hasLiked: false };
  } catch {
    return { count: 0, hasLiked: false };
  }
}

// 获取所有本地点赞数据
function getAllLocalLikes(): LikeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 发送 API 请求（带超时）
async function sendLikeRequest(memoId: number, action: 'like' | 'unlike'): Promise<{ count: number; hasLiked: boolean } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

  try {
    const response = await fetch("/api/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoId, action }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const serverData = await response.json();
      const allLocalLikes = getAllLocalLikes();
      const localCount = allLocalLikes.filter(like => like.memoId === memoId).length;
      return {
        count: Math.max(serverData.count, localCount),
        hasLiked: action === 'like',
      };
    }
    return null;
  } catch (error) {
    clearTimeout(timeoutId);
    return null;
  }
}

interface LikeButtonProps {
  memoId: number;
  className?: string;
  onLikeDataChange?: (data: LikeData) => void;
  showCount?: boolean;
}

export interface LikeData {
  count: number;
  hasLiked: boolean;
}

export default function LikeButton({ memoId, className, onLikeDataChange, showCount = true }: LikeButtonProps) {
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, hasLiked: false });
  const [isAnimating, setIsAnimating] = useState(false);

  // 获取点赞数据 - 优先使用本地存储
  const fetchLikeData = useCallback(async () => {
    // 首先获取本地存储的数据
    const localData = getLocalLikeData(memoId);
    
    // 如果本地有数据，先显示本地数据
    if (localData.count > 0 || localData.hasLiked) {
      setLikeData(localData);
    }
    
    // 然后尝试从 API 获取数据（用于同步其他用户的点赞）
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      const response = await fetch(`/api/likes?memoId=${memoId}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const serverData = await response.json();
        // 合并服务器数据和本地数据
        // 如果用户已点赞（本地存储为准），使用本地状态
        // 点赞数取服务器和本地的最大值
        const allLocalLikes = getAllLocalLikes();
        const localCount = allLocalLikes.filter(like => like.memoId === memoId).length;
        const mergedData = {
          count: Math.max(serverData.count, localCount),
          hasLiked: localData.hasLiked || serverData.hasLiked,
        };
        setLikeData(mergedData);
      }
    } catch (error) {
      // API 失败时，已经设置了本地数据
    }
  }, [memoId]);

  // 初始加载 - 使用 startTransition 避免阻塞渲染
  useEffect(() => {
    if (siteConfig.likes.enabled) {
      // 使用 setTimeout 将数据获取推迟到渲染完成后
      const timer = setTimeout(() => {
        fetchLikeData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [fetchLikeData]);

  // 当点赞数据变化时通知父组件
  useEffect(() => {
    onLikeDataChange?.(likeData);
  }, [likeData, onLikeDataChange]);

  // 处理点赞/取消点赞
  const handleLike = async () => {
    const isUnlike = likeData.hasLiked;

    // 先更新本地存储
    let localData;
    if (isUnlike) {
      localData = removeLocalLike(memoId);
    } else {
      localData = saveLocalLike(memoId);
    }
    
    // 乐观更新：立即更新 UI（不阻塞用户交互）
    setLikeData(localData);
    setIsAnimating(true);
    
    // 动画持续 300ms
    setTimeout(() => setIsAnimating(false), 300);

    // 后台发送 API 请求（不阻塞用户交互）
    const action = isUnlike ? "unlike" : "like";
    sendLikeRequest(memoId, action).then((serverData) => {
      if (serverData) {
        // 如果服务器返回成功，更新 UI
        setLikeData(serverData);
      }
      // 如果失败，本地存储已经是最新的，不需要额外处理
    });
  };

  // 如果点赞功能被禁用，不渲染
  if (!siteConfig.likes.enabled) {
    return null;
  }

  return (
    <button
      onClick={handleLike}
      className={cn(
        "flex items-center gap-1.5 transition-all duration-200",
        likeData.hasLiked
          ? "text-pink-500 hover:text-pink-400"
          : "text-inherit hover:opacity-80",
        className
      )}
      title={likeData.hasLiked ? "取消点赞" : "点赞"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-300",
          likeData.hasLiked
            ? "fill-pink-500 text-pink-500 scale-110"
            : "fill-transparent text-current",
          isAnimating && (likeData.hasLiked ? "scale-125" : "scale-90")
        )}
      />
      {showCount && (
        <span className="text-sm font-medium min-w-[1.5rem] text-center">
          {likeData.count}
        </span>
      )}
    </button>
  );
}
