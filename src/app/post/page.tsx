"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { createMemo } from "@/lib/api";

export default function PostPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("请输入内容");
      return;
    }

    setIsSubmitting(true);

    try {
      // 获取认证 token
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("请先登录");
        router.push("/");
        return;
      }

      // 创建说说
      const memo = await createMemo(
        {
          content: content,
          visibility: "PUBLIC",
        },
        token
      );

      if (memo) {
        alert("发表成功！");
        router.push("/");
      } else {
        alert("发表失败，请重试");
      }
    } catch (error) {
      console.error("发表失败:", error);
      alert("发表失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
      )}
    >
      <div className="max-w-[600px] mx-auto pt-5 px-4">
        <div
          className={cn(
            "rounded-xl shadow-md p-5 transition-colors duration-300",
            isDark ? "bg-[#2d2d2d]" : "bg-white"
          )}
        >
          {/* 头部 */}
          <div className="flex items-center mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-gray-600 dark:text-gray-400 text-sm mr-4 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              返回主页
            </button>
            <h2
              className={cn(
                "text-lg font-medium transition-colors duration-300",
                isDark ? "text-gray-100" : "text-gray-800"
              )}
            >
              发表说说
            </h2>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit}>
            {/* 内容输入 */}
            <div className="mb-5">
              <label
                className={cn(
                  "block text-sm font-semibold mb-2 transition-colors duration-300",
                  isDark ? "text-gray-300" : "text-gray-600"
                )}
              >
                此刻想法
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="这一刻的想法..."
                rows={8}
                className={cn(
                  "w-full px-3 py-3 border rounded-lg resize-y text-base leading-relaxed focus:outline-none focus:border-[#07c160] transition-all duration-300",
                  isDark
                    ? "bg-[#3d3d3d] border-gray-600 text-gray-100 placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-800"
                )}
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push("/")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg text-sm font-medium transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed btn-hover"
              >
                {isSubmitting ? "发表中..." : "立即发表"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
