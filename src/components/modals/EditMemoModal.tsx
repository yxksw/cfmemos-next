"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateMemo } from "@/lib/api";
import type { Memo } from "@/types/memo";

interface EditMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: Memo | null;
  onSuccess?: () => void;
}

export default function EditMemoModal({
  isOpen,
  onClose,
  memo,
  onSuccess,
}: EditMemoModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当 memo 变化时，初始化表单数据
  useEffect(() => {
    if (memo) {
      // 提取内容（去除位置和音乐信息）
      const cleanContent = memo.content
        .replace(/位置[:：]\s*.+\n?/g, "")
        .replace(/音乐[:：]\s*.+\n?/g, "")
        .trim();
      setContent(cleanContent);
    }
  }, [memo]);

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memo) return;

    if (!content.trim()) {
      alert("请输入内容");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("请先登录");
        return;
      }

      // 更新说说
      const updatedMemo = await updateMemo(
        memo.id,
        {
          content: content,
          visibility: "PUBLIC",
        },
        token
      );

      if (updatedMemo) {
        alert("更新成功！");
        onSuccess?.();
      } else {
        alert("更新失败，请重试");
      }
    } catch (error) {
      console.error("更新失败:", error);
      alert("更新失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !memo) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#2d2d2d] w-full max-w-[500px] rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            编辑说说
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
          {/* 内容输入 */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="这一刻的想法..."
              rows={8}
              className={cn(
                "w-full px-3 py-3 border rounded-lg resize-y text-base leading-relaxed focus:outline-none focus:border-[#07c160] transition-all duration-300",
                "bg-white dark:bg-[#3d3d3d] border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              )}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg text-sm font-medium transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "保存中..." : "保存修改"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
