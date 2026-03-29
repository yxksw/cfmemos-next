import { Suspense } from "react";
import { getMemos } from "@/lib/api";
import { siteConfig } from "@/config/site";
import type { Memo } from "@/types/memo";

import Header from "@/components/Header";
import Cover from "@/components/Cover";
import MemoCard from "@/components/MemoCard";
import MemoCardSkeleton from "@/components/MemoCardSkeleton";
import Footer from "@/components/Footer";
import MusicPlayer from "@/components/MusicPlayer";
import NewMusicPlayer from "@/components/NewMusicPlayer";
import Pagination from "@/components/Pagination";
import Live2DWidget from "@/components/Live2DWidget";
import ClientHome from "@/components/ClientHome";

// ISR 配置 - 60秒重新验证
export const revalidate = 60;

// 获取说说数据
async function fetchMemos(page: number = 1): Promise<{ memos: Memo[]; totalPages: number; totalCount: number }> {
  const limit = siteConfig.pagination.pageSize;
  const offset = (page - 1) * limit;

  try {
    const data = await getMemos({ limit: limit + 1, offset });

    const hasMore = data.length > limit;
    const currentPageData = hasMore ? data.slice(0, limit) : data;

    let totalPages = 1;
    let totalCount = currentPageData.length;

    if (page === 1) {
      if (currentPageData.length >= limit) {
        totalPages = page + (hasMore ? 1 : 0);
        totalCount = hasMore ? limit + 1 : limit;
      }
    } else {
      totalPages = hasMore ? page + 1 : page;
      totalCount = (page - 1) * limit + currentPageData.length;
    }

    return { memos: currentPageData, totalPages, totalCount };
  } catch (error) {
    console.error("获取说说失败:", error);
    return { memos: [], totalPages: 1, totalCount: 0 };
  }
}

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const { memos, totalPages, totalCount } = await fetchMemos(currentPage);

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#1a1a1a] transition-colors duration-300">
      {/* 顶部导航 */}
      <Header />

      {/* 主内容区 */}
      <main className="max-w-[576px] mx-auto pb-20">
        {/* 封面 */}
        <Cover />

        {/* 个性签名 */}
        <div className="text-right text-gray-500 dark:text-gray-400 text-base py-2.5 pr-4 bg-white dark:bg-[#1a1a1a] transition-colors duration-300">
          {siteConfig.author.signature}
        </div>

        {/* 说说列表容器 */}
        <div className="mt-0 bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
          {memos.length > 0 ? (
            <Suspense fallback={
              <>
                <MemoCardSkeleton />
                <MemoCardSkeleton />
                <MemoCardSkeleton />
              </>
            }>
              {memos.map((memo) => (
                <MemoCard key={memo.id} memo={memo} />
              ))}
            </Suspense>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              暂无说说
            </div>
          )}
        </div>

        {/* 分页 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
        />

        {/* 数据统计 */}
        {totalCount > 0 && (
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            共 {totalCount} 条说说，每页 {siteConfig.pagination.pageSize} 条
          </div>
        )}

        {/* 底部 */}
        <Footer />
      </main>

      {/* 音乐播放器 - 旧版（已禁用） */}
      {siteConfig.music.enabled && <MusicPlayer />}

      {/* Live2D 看板娘 */}
      <Live2DWidget />

      {/* 客户端交互组件 */}
      <ClientHome />
    </div>
  );
}
