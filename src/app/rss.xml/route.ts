import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getMemos } from "@/lib/api";
import { formatRssDate } from "@/lib/utils";

// 配置为静态导出
export const dynamic = "force-static";
export const revalidate = 3600; // 1小时重新生成

export async function GET() {
  try {
    // 获取最新的说说
    const memos = await getMemos({ limit: 20 });

    // 生成 RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.rss.title)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.rss.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
    ${memos
      .map(
        (memo) => `
    <item>
      <title>${escapeXml(memo.content.slice(0, 50))}${memo.content.length > 50 ? "..." : ""}</title>
      <link>${siteConfig.url}/#memo-${memo.id}</link>
      <guid>${siteConfig.url}/#memo-${memo.id}</guid>
      <pubDate>${formatRssDate(memo.createdTs)}</pubDate>
      <description>${escapeXml(memo.content)}</description>
      <author>${escapeXml(memo.creatorEmailHash)}</author>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("生成 RSS 失败:", error);
    return new NextResponse("生成 RSS 失败", { status: 500 });
  }
}

// XML 转义函数
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
