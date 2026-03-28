"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface LikeButtonProps {
  memoId: number;
  className?: string;
}

interface LikeData {
  count: number;
  hasLiked: boolean;
}

export default function LikeButton({ memoId, className }: LikeButtonProps) {
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, hasLiked: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 获取点赞数据
  const fetchLikeData = useCallback(async () => {
    try {
      const response = await fetch(`/api/likes?memoId=${memoId}`);
      if (response.ok) {
        const data = await response.json();
        setLikeData(data);
      }
    } catch (error) {
      console.error("[LikeButton] Failed to fetch like data:", error);
    }
  }, [memoId]);

  // 初始加载
  useEffect(() => {
    if (siteConfig.likes.enabled) {
      fetchLikeData();
    }
  }, [fetchLikeData]);

  // 处理点赞/取消点赞
  const handleLike = async () => {
    if (isLoading) return;

    const isUnlike = likeData.hasLiked;
    setIsLoading(true);
    setIsAnimating(true);

    // 乐观更新：先更新 UI
    setLikeData((prev) => ({
      count: isUnlike ? prev.count - 1 : prev.count + 1,
      hasLiked: !isUnlike,
    }));

    try {
      const action = isUnlike ? "unlike" : "like";
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memoId, action }),
      });

      if (!response.ok) {
        // 如果请求失败，回滚 UI
        setLikeData((prev) => ({
          count: isUnlike ? prev.count + 1 : prev.count - 1,
          hasLiked: isUnlike,
        }));

        if (response.status === 409) {
          // 已经点赞过了
          setLikeData((prev) => ({ ...prev, hasLiked: true }));
        }
      }
    } catch (error) {
      console.error("[LikeButton] Failed to update like:", error);
      // 请求失败，回滚 UI
      setLikeData((prev) => ({
        count: isUnlike ? prev.count + 1 : prev.count - 1,
        hasLiked: isUnlike,
      }));
    } finally {
      setIsLoading(false);
      // 动画持续 300ms
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // 如果点赞功能被禁用，不渲染
  if (!siteConfig.likes.enabled) {
    return null;
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-1.5 transition-all duration-200",
        likeData.hasLiked
          ? "text-pink-500 hover:text-pink-400"
          : "text-inherit hover:opacity-80",
        isLoading && "opacity-50 cursor-not-allowed",
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
      <span className="text-sm font-medium min-w-[1.5rem] text-center">
        {likeData.count}
      </span>
    </button>
  );
}
