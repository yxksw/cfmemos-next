"use client";

import { memo } from "react";

function MemoCardSkeleton() {
  return (
    <article className="bg-white dark:bg-[#2d2d2d] p-4 mb-0 shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] border-b border-gray-100 dark:border-gray-700 animate-pulse">
      {/* 头部骨架 */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center">
          {/* 头像骨架 */}
          <div className="w-8 h-8 rounded-sm mr-2.5 bg-gray-200 dark:bg-gray-700" />
          <div>
            {/* 用户名骨架 */}
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            {/* 时间骨架 */}
            <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* 内容骨架 */}
      <div className="ml-10 space-y-2 my-2.5">
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* 图片网格骨架 */}
      <div className="ml-10 grid grid-cols-3 gap-1.5 my-2.5">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* 底部操作栏骨架 */}
      <div className="flex justify-end items-center py-2 ml-10">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </article>
  );
}

export default memo(MemoCardSkeleton);
