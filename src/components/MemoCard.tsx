"use client";

import { useState } from "react";
import type { Memo } from "@/types/memo";
import { formatDateTime, getImageGridClass } from "@/lib/utils";
import { MoreHorizontal, MapPin, Music, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface MemoCardProps {
  memo: Memo;
  onCommentClick?: (memoId: number) => void;
  onEditClick?: (memo: Memo) => void;
  onDeleteClick?: (memoId: number) => void;
  isLoggedIn?: boolean;
}

export default function MemoCard({ 
  memo, 
  onCommentClick, 
  onEditClick, 
  onDeleteClick,
  isLoggedIn = false 
}: MemoCardProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const images = memo.resourceList
    .filter(r => r.type.startsWith("image/"))
    .slice(0, 9);
  
  const imageCount = images.length;
  const gridClass = getImageGridClass(imageCount);
  
  // 提取位置和音乐信息
  const locationMatch = memo.content.match(/位置[:：]\s*(.+)/);
  const location = locationMatch ? locationMatch[1].trim() : null;
  
  const musicMatch = memo.content.match(/音乐[:：]\s*(.+)/);
  const music = musicMatch ? musicMatch[1].trim() : null;
  
  // 清理内容
  const cleanContent = memo.content
    .replace(/位置[:：]\s*.+\n?/g, "")
    .replace(/音乐[:：]\s*.+\n?/g, "")
    .trim();

  const openLightbox = (src: string) => {
    setLightboxImage(src);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "";
  };

  return (
    <>
      <article className="bg-white dark:bg-[#2d2d2d] p-4 mb-0 shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] border-b border-gray-100 dark:border-gray-700">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center">
            <img
              src={siteConfig.author.avatar}
              alt={memo.creatorName}
              className="w-8 h-8 rounded-sm mr-2.5"
            />
            <div>
              <div className="font-bold text-base text-gray-900 dark:text-gray-100">
                {memo.creatorName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {formatDateTime(memo.createdTs)}
              </div>
            </div>
          </div>
          
          {/* 编辑和删除按钮 - 仅登录时显示 */}
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditClick?.(memo)}
                className="p-1.5 text-gray-400 hover:text-[#07c160] transition-colors"
                title="编辑"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteClick?.(memo.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 内容 */}
        {cleanContent && (
          <div className="leading-relaxed my-2.5 ml-10 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {cleanContent}
          </div>
        )}

        {/* 图片网格 */}
        {imageCount > 0 && (
          <div className={cn("grid gap-1.5 my-2.5 ml-10", gridClass)}>
            {images.map((img, index) => (
              <div
                key={img.id}
                className={cn(
                  "relative overflow-hidden rounded cursor-zoom-in bg-gray-100 dark:bg-gray-800",
                  imageCount === 1 ? "max-w-[50%]" : "aspect-square"
                )}
                onClick={() => openLightbox(img.externalLink)}
              >
                <img
                  src={img.externalLink}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* 音乐信息 */}
        {music && (
          <div className="my-2.5 ml-10 text-xs text-[#576b95] dark:text-[#6ab3ff] flex items-center gap-1">
            <Music className="w-3 h-3" />
            {music}
          </div>
        )}

        {/* 底部信息栏 */}
        <div className="flex justify-end items-center py-2 text-xs text-gray-500 dark:text-gray-400 ml-10">
          <button
            onClick={() => onCommentClick?.(memo.id)}
            className="text-[#07c160] hover:opacity-80 transition-opacity p-1"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 位置信息 */}
        {location && (
          <div className="mt-1 ml-10 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}
      </article>

      {/* 灯箱 */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[3000] bg-black/90 flex flex-col items-center justify-center opacity-100 transition-opacity duration-300"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-5 right-9 text-white/90 text-4xl font-bold hover:text-white transition-colors select-none"
            onClick={closeLightbox}
          >
            &times;
          </button>
          <img
            src={lightboxImage}
            alt="放大图片"
            className="max-w-[90%] max-h-[80vh] rounded shadow-2xl transform scale-100 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
