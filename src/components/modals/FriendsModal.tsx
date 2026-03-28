"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { getFriends, type FriendLink } from "@/lib/friends";
import { cn } from "@/lib/utils";

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendsModal({ isOpen, onClose }: FriendsModalProps) {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFriends();
      setLinks(data);
    } catch (err) {
      setError("加载友链失败");
      console.error("加载友链失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center opacity-100 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#2d2d2d] w-[90%] max-w-[360px] rounded-xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            我的朋友
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 友链列表 */}
        <div className="p-5 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>{error}</p>
              <button
                onClick={loadFriends}
                className="mt-2 text-[#07c160] hover:underline text-sm"
              >
                重试
              </button>
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-2.5">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg",
                    "hover:bg-gray-50 dark:hover:bg-[#3d3d3d] transition-colors group"
                  )}
                  title={link.description}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-full mr-3 flex-shrink-0 overflow-hidden">
                    <img
                      src={link.avatar || "https://q1.qlogo.cn/g?b=qq&nk=0&s=100"}
                      alt={link.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://q1.qlogo.cn/g?b=qq&nk=0&s=100";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 dark:text-gray-100 text-[15px] truncate">
                      {link.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {link.url}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              暂无友链
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 bg-gray-100 dark:bg-[#3d3d3d] hover:bg-gray-200 dark:hover:bg-[#4d4d4d] text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
