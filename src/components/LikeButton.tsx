"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

// 本地存储点赞数据（当 API 不可用时使用）
const STORAGE_KEY = 'cfmemos-likes';

interface LikeRecord {
  memoId: number;
  userFingerprint: string;
  createdAt: string;
  userName?: string; // 用户名（如果有）
}

interface LikeUser {
  author: string;
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
function getLocalLikeData(memoId: number): { count: number; hasLiked: boolean; likeUsers: LikeUser[] } {
  if (typeof window === 'undefined') return { count: 0, hasLiked: false, likeUsers: [] };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const likes: LikeRecord[] = data ? JSON.parse(data) : [];
    const userFingerprint = getUserFingerprint();
    const memoLikes = likes.filter(like => like.memoId === memoId);
    const count = memoLikes.length;
    const hasLiked = memoLikes.some(like => like.userFingerprint === userFingerprint);
    const likeUsers = memoLikes
      .filter(like => like.userName)
      .map(like => ({ author: like.userName || '匿名用户' }))
      .slice(0, 3); // 只取前3个用户
    return { count, hasLiked, likeUsers };
  } catch {
    return { count: 0, hasLiked: false, likeUsers: [] };
  }
}

// 保存点赞到本地存储
function saveLocalLike(memoId: number): { count: number; hasLiked: boolean; likeUsers: LikeUser[] } {
  if (typeof window === 'undefined') return { count: 0, hasLiked: false, likeUsers: [] };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const likes: LikeRecord[] = data ? JSON.parse(data) : [];
    const userFingerprint = getUserFingerprint();
    
    // 检查是否已点赞
    const hasLiked = likes.some(like => like.memoId === memoId && like.userFingerprint === userFingerprint);
    if (hasLiked) {
      const memoLikes = likes.filter(like => like.memoId === memoId);
      const count = memoLikes.length;
      const likeUsers = memoLikes
        .filter(like => like.userName)
        .map(like => ({ author: like.userName || '匿名用户' }))
        .slice(0, 3);
      return { count, hasLiked: true, likeUsers };
    }
    
    // 添加点赞
    likes.push({
      memoId,
      userFingerprint,
      createdAt: new Date().toISOString(),
      userName: '我', // 默认为"我"
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
    
    const memoLikes = likes.filter(like => like.memoId === memoId);
    const count = memoLikes.length;
    const likeUsers = memoLikes
      .filter(like => like.userName)
      .map(like => ({ author: like.userName || '匿名用户' }))
      .slice(0, 3);
    return { count, hasLiked: true, likeUsers };
  } catch {
    return { count: 0, hasLiked: false, likeUsers: [] };
  }
}

// 取消本地存储的点赞
function removeLocalLike(memoId: number): { count: number; hasLiked: boolean; likeUsers: LikeUser[] } {
  if (typeof window === 'undefined') return { count: 0, hasLiked: false, likeUsers: [] };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let likes: LikeRecord[] = data ? JSON.parse(data) : [];
    const userFingerprint = getUserFingerprint();
    
    // 移除点赞
    likes = likes.filter(like => !(like.memoId === memoId && like.userFingerprint === userFingerprint));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
    
    const memoLikes = likes.filter(like => like.memoId === memoId);
    const count = memoLikes.length;
    const likeUsers = memoLikes
      .filter(like => like.userName)
      .map(like => ({ author: like.userName || '匿名用户' }))
      .slice(0, 3);
    return { count, hasLiked: false, likeUsers };
  } catch {
    return { count: 0, hasLiked: false, likeUsers: [] };
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
async function sendLikeRequest(memoId: number, action: 'like' | 'unlike'): Promise<{ count: number; hasLiked: boolean; likeUsers: LikeUser[] } | null> {
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
      const localLikes = allLocalLikes.filter(like => like.memoId === memoId);
      const localCount = localLikes.length;
      const likeUsers = localLikes
        .filter(like => like.userName)
        .map(like => ({ author: like.userName || '匿名用户' }))
        .slice(0, 3);
      return {
        count: Math.max(serverData.count || 0, localCount),
        hasLiked: action === 'like',
        likeUsers,
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
  showUsers?: boolean;
}

export interface LikeData {
  count: number;
  hasLiked: boolean;
  likeUsers?: LikeUser[];
}

function LikeButton({ memoId, className, onLikeDataChange, showCount = true, showUsers = false }: LikeButtonProps) {
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, hasLiked: false, likeUsers: [] });
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
        const localLikes = allLocalLikes.filter(like => like.memoId === memoId);
        const localCount = localLikes.length;
        const likeUsers = localLikes
          .filter(like => like.userName)
          .map(like => ({ author: like.userName || '匿名用户' }))
          .slice(0, 3);
        const mergedData = {
          count: Math.max(serverData.count || 0, localCount),
          hasLiked: localData.hasLiked || serverData.hasLiked || false,
          likeUsers,
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

  // 生成点赞文本
  const generateLikesText = () => {
    const { count, likeUsers } = likeData;
    if (count === 0) {
      return '0个点赞';
    }

    if (!likeUsers || likeUsers.length === 0) {
      return `${count}个点赞`;
    }

    // 显示前3个用户名
    const names = likeUsers.map(user => user.author).join('、');
    return `${names}、${count}个点赞`;
  };

  // 如果点赞功能被禁用，不渲染
  if (!siteConfig.likes.enabled) {
    return null;
  }

  // 显示用户列表的点赞区域
  if (showUsers && likeData.count > 0) {
    return (
      <div 
        onClick={handleLike}
        className={cn(
          "p-3 mt-2 bg-gray-50 dark:bg-[#2a2a2a] rounded-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333]",
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          <Heart
            className={cn(
              "w-4 h-4 transition-all duration-300",
              likeData.hasLiked
                ? "fill-[#ff6b6b] text-[#ff6b6b]"
                : "fill-transparent text-[#576b95] dark:text-[#6ab3ff]",
              isAnimating && (likeData.hasLiked ? "scale-125" : "scale-90")
            )}
          />
          <span className="text-[#576b95] dark:text-[#6ab3ff]">
            {generateLikesText()}
          </span>
        </div>
      </div>
    );
  }

  // 普通点赞按钮
  return (
    <button
      onClick={handleLike}
      className={cn(
        "flex items-center gap-1.5 transition-all duration-200",
        likeData.hasLiked
          ? "text-[#ff6b6b] hover:text-[#ff5252]"
          : "text-inherit hover:opacity-80",
        className
      )}
      title={likeData.hasLiked ? "取消点赞" : "点赞"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-300",
          likeData.hasLiked
            ? "fill-[#ff6b6b] text-[#ff6b6b] scale-110"
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

// 使用 React.memo 优化渲染性能
export default memo(LikeButton, (prevProps, nextProps) => {
  return (
    prevProps.memoId === nextProps.memoId &&
    prevProps.showCount === nextProps.showCount &&
    prevProps.showUsers === nextProps.showUsers
  );
});
