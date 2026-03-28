"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, ImagePlus } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { createMemo, uploadResource } from "@/lib/api";

export default function PostPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 9;

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 检查总数限制
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > MAX_IMAGES) {
      alert(`最多只能上传 ${MAX_IMAGES} 张图片`);
      return;
    }

    // 过滤图片文件
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    
    // 生成预览
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles((prev) => [...prev, ...imageFiles]);
    
    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    if (selectedFiles.length >= MAX_IMAGES) {
      alert(`最多只能上传 ${MAX_IMAGES} 张图片`);
      return;
    }
    fileInputRef.current?.click();
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && selectedFiles.length === 0) {
      alert("请输入内容或上传图片");
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

      // 上传图片
      const resourceIds: number[] = [];
      for (const file of selectedFiles) {
        const result = await uploadResource(file, token);
        if (result) {
          resourceIds.push(result.id);
        }
      }

      // 组合内容
      let fullContent = content;
      if (location) {
        fullContent += `\n位置：${location}`;
      }

      // 创建说说
      const memo = await createMemo(
        {
          content: fullContent,
          visibility: "PUBLIC",
          resourceIdList: resourceIds.length > 0 ? resourceIds : undefined,
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
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
    )}>
      <div className="max-w-[600px] mx-auto pt-5 px-4">
        <div className={cn(
          "rounded-xl shadow-md p-5 transition-colors duration-300",
          isDark ? "bg-[#2d2d2d]" : "bg-white"
        )}>
          {/* 头部 */}
          <div className="flex items-center mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-gray-600 dark:text-gray-400 text-sm mr-4 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              返回主页
            </button>
            <h2 className={cn(
              "text-lg font-medium transition-colors duration-300",
              isDark ? "text-gray-100" : "text-gray-800"
            )}>
              发表说说
            </h2>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit}>
            {/* 内容输入 */}
            <div className="mb-5">
              <label className={cn(
                "block text-sm font-semibold mb-2 transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                此刻想法
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="这一刻的想法..."
                rows={5}
                className={cn(
                  "w-full px-3 py-3 border rounded-lg resize-y text-base leading-relaxed focus:outline-none focus:border-[#07c160] transition-all duration-300",
                  isDark 
                    ? "bg-[#3d3d3d] border-gray-600 text-gray-100 placeholder-gray-500" 
                    : "bg-white border-gray-200 text-gray-800"
                )}
              />
            </div>

            {/* 位置输入 */}
            <div className="mb-5">
              <label className={cn(
                "block text-sm font-semibold mb-2 transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                位置
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例如：浙江"
                className={cn(
                  "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#07c160] transition-all duration-300",
                  isDark 
                    ? "bg-[#3d3d3d] border-gray-600 text-gray-100 placeholder-gray-500" 
                    : "bg-white border-gray-200 text-gray-800"
                )}
              />
            </div>

            {/* 图片上传 */}
            <div className="mb-5">
              <label className={cn(
                "block text-sm font-semibold mb-2 transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                配图 (最多{MAX_IMAGES}张)
              </label>
              
              <div className="flex flex-wrap gap-2.5">
                {/* 预览图 */}
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <img
                      src={preview}
                      alt={`预览 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* 添加按钮 */}
                {selectedFiles.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className={cn(
                      "w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-2xl transition-all duration-300",
                      isDark
                        ? "border-gray-600 text-gray-500 hover:border-[#07c160] hover:text-[#07c160] hover:bg-[#1e3a2f]"
                        : "border-gray-300 text-gray-400 hover:border-[#07c160] hover:text-[#07c160] hover:bg-green-50"
                    )}
                  >
                    <ImagePlus className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className={cn(
                "text-xs mt-2 text-right transition-colors duration-300",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                已选择 {selectedFiles.length} 张 / 最多 {MAX_IMAGES} 张
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
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
