import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并 Tailwind 类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化时间戳（相对时间）
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) {
    return "刚刚";
  }

  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }

  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }

  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }

  // 大于7天，显示日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (year === now.getFullYear()) {
    return `${month}月${day}日`;
  }

  return `${year}年${month}月${day}日`;
}

// 格式化时间戳（具体时间）
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 格式化日期
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
}

// 获取 Gravatar 头像
export function getGravatarUrl(emailHash: string, size: number = 80): string {
  return `https://cn.cravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
}

// 解析图片网格类名
export function getImageGridClass(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-3";
}

// 提取位置信息（从内容中）
export function extractLocation(content: string): string | null {
  const locationMatch = content.match(/位置[:：]\s*(.+)/);
  return locationMatch ? locationMatch[1].trim() : null;
}

// 提取音乐信息（从内容中）
export function extractMusic(content: string): string | null {
  const musicMatch = content.match(/音乐[:：]\s*(.+)/);
  return musicMatch ? musicMatch[1].trim() : null;
}

// 清理内容（移除特殊标记）
export function cleanContent(content: string): string {
  return content
    .replace(/位置[:：]\s*.+\n?/g, "")
    .replace(/音乐[:：]\s*.+\n?/g, "")
    .trim();
}

// 生成 RSS 日期格式
export function formatRssDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toUTCString();
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
