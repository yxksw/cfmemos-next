"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await onLogin(username, password);
      if (success) {
        setUsername("");
        setPassword("");
        onClose();
      } else {
        setError("用户名或密码错误");
      }
    } catch {
      setError("登录失败，请重试");
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
        className={cn(
          "bg-white dark:bg-[#2d2d2d] w-[90%] max-w-[360px] rounded-xl shadow-xl overflow-hidden",
          "transform transition-transform duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            用户登录
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-[#3d3d3d] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#07c160] dark:focus:border-[#07c160]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-[#3d3d3d] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#07c160] dark:focus:border-[#07c160]"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mb-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#07c160] hover:bg-[#06ad56] text-white font-medium rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "登录中..." : "立即登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
