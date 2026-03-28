"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 最多显示的页码数

    if (totalPages <= maxVisible) {
      // 总页数较少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数较多，需要省略
      if (currentPage <= 3) {
        // 当前页在前几页
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后几页
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-1.5 mt-5 py-2.5 flex-wrap">
      {/* 上一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "px-2.5 py-1.5 text-sm rounded border transition-colors bg-white dark:bg-[#2d2d2d] flex items-center gap-1",
          currentPage === 1
            ? "text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">上一页</span>
      </button>

      {/* 页码按钮 */}
      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..." || page === currentPage}
          className={cn(
            "min-w-[36px] px-2.5 py-1.5 text-sm rounded border transition-colors",
            page === currentPage
              ? "bg-[#07c160] text-white border-[#07c160]"
              : page === "..."
              ? "bg-transparent border-transparent text-gray-500 cursor-default"
              : "bg-white dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
        >
          {page}
        </button>
      ))}

      {/* 下一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "px-2.5 py-1.5 text-sm rounded border transition-colors bg-white dark:bg-[#2d2d2d] flex items-center gap-1",
          currentPage >= totalPages
            ? "text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
      >
        <span className="hidden sm:inline">下一页</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
