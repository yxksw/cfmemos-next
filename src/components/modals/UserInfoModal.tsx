"use client";

import { X, User, Mail, Link, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function UserInfoModal({ isOpen, onClose, onLogout }: UserInfoModalProps) {
  const { author, url } = siteConfig;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center opacity-100 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#2d2d2d] w-[90%] max-w-[360px] rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            用户信息
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 用户信息 */}
        <div className="p-5 text-center">
          <img
            src={author.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-3 border-[#07c160] p-0.5 mx-auto mb-4 object-cover"
          />

          <div className="space-y-3">
            <InfoRow icon={<User className="w-5 h-5" />} label="昵称" value={author.name} />
            <InfoRow icon={<Mail className="w-5 h-5" />} label="邮箱" value={author.email} />
            <InfoRow
              icon={<Link className="w-5 h-5" />}
              label="网址"
              value={url}
              valueClassName="text-[#07c160]"
            />
            <InfoRow
              icon={<Shield className="w-5 h-5" />}
              label="权限组"
              value="管理员"
              valueClassName="text-red-500 font-bold"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-5">
            <a
              href="/admin"
              className="flex-1 py-2.5 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg text-sm font-medium transition-colors"
            >
              管理后台
            </a>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex-1 py-2.5 bg-white dark:bg-[#3d3d3d] border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function InfoRow({ icon, label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-center bg-gray-50 dark:bg-[#3d3d3d] px-3 py-3 rounded-lg text-left">
      <div className="text-[#07c160] mr-3">{icon}</div>
      <span className="w-[70px] text-gray-500 dark:text-gray-400 text-sm">{label}:</span>
      <span className={cn("flex-1 text-sm text-gray-800 dark:text-gray-200 break-all", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
