"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchMemos } from "@/lib/api";
import type { Memo } from "@/types/memo";
import MemoCard from "@/components/MemoCard";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 处理搜索
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await searchMemos(keyword.trim());
      setResults(data);
    } catch (error) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword]);

  // 监听回车键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 清空搜索
  const handleClear = () => {
    setKeyword("");
    setResults([]);
    setHasSearched(false);
  };

  // 关闭时清空
  useEffect(() => {
    if (!isOpen) {
      handleClear();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 模态框 */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#2d2d2d] rounded-xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            搜索文章
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 搜索输入框 */}
        <div className="px-6 py-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入关键词搜索文章..."
                className={cn(
                  "w-full px-4 py-2.5 pr-10 rounded-lg border",
                  "bg-gray-50 dark:bg-[#1a1a1a]",
                  "text-gray-900 dark:text-white",
                  "border-gray-200 dark:border-gray-700",
                  "focus:outline-none focus:ring-2 focus:ring-[#07c160] focus:border-transparent",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500"
                )}
              />
              {keyword && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !keyword.trim()}
              className={cn(
                "px-4 py-2.5 rounded-lg flex items-center gap-2",
                "bg-[#07c160] text-white",
                "hover:bg-[#06ad56] transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 搜索结果 */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          {!hasSearched ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>输入关键词开始搜索</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#07c160]" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">搜索中...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>未找到相关内容</p>
              <p className="text-xs mt-2 text-gray-400">
                提示：搜索功能需要后端API支持 /memo/search 端点
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                找到 {results.length} 条结果
              </p>
              {results.map((memo) => (
                <MemoCard key={memo.id} memo={memo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
