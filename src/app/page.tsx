"use client";

import { useState, useEffect, useCallback } from "react";
import { siteConfig } from "@/config/site";
import { getMemos, loginUser, deleteMemo } from "@/lib/api";
import type { Memo } from "@/types/memo";

import Header from "@/components/Header";
import Cover from "@/components/Cover";
import MemoCard from "@/components/MemoCard";
import Footer from "@/components/Footer";
import MusicPlayer from "@/components/MusicPlayer";
import TwikooComments from "@/components/TwikooComments";

import LoginModal from "@/components/modals/LoginModal";
import FriendsModal from "@/components/modals/FriendsModal";
import EditMemoModal from "@/components/modals/EditMemoModal";

import Pagination from "@/components/Pagination";
import Live2DWidget from "@/components/Live2DWidget";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string>("");

  // 模态框状态
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  // 评论展开状态
  const [expandedComments, setExpandedComments] = useState<number | null>(null);

  // 加载说说列表
  const loadMemos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const limit = siteConfig.pagination.pageSize;
      const offset = (currentPage - 1) * limit;

      // 先获取总数（通过请求大量数据来估算，或者 API 可能返回总数）
      // 这里我们先获取当前页数据，同时多获取一条来判断是否有下一页
      const data = await getMemos({ limit: limit + 1, offset });

      // 判断是否有下一页
      const hasMore = data.length > limit;
      const currentPageData = hasMore ? data.slice(0, limit) : data;

      setMemos(currentPageData);

      // 计算总页数（根据当前页和是否有更多数据来估算）
      if (currentPage === 1) {
        // 第一页：如果数据少于 limit，总页数就是 1
        if (currentPageData.length < limit) {
          setTotalPages(1);
          setTotalCount(currentPageData.length);
        } else {
          // 需要获取更多数据来确定总数
          // 暂时假设有更多页，直到最后一页
          setTotalPages(currentPage + (hasMore ? 1 : 0));
          setTotalCount(hasMore ? limit + 1 : limit);
        }
      } else {
        // 非第一页：根据是否有更多数据更新总页数
        if (hasMore) {
          setTotalPages(currentPage + 1);
        } else {
          setTotalPages(currentPage);
        }
        setTotalCount((currentPage - 1) * limit + currentPageData.length);
      }
    } catch (err) {
      console.error("加载说说失败:", err);
      setError("服务器暂时不可用，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  // 初始加载
  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  // 处理登录
  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await loginUser(username, password);
      if (result && result.token) {
        localStorage.setItem("auth_token", result.token);
        setAuthToken(result.token);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // 处理退出
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setAuthToken("");
    setIsLoggedIn(false);
  };

  // 处理编辑说说
  const handleEditClick = (memo: Memo) => {
    setEditingMemo(memo);
    setShowEditModal(true);
  };

  // 处理删除说说
  const handleDeleteClick = async (memoId: number) => {
    if (!confirm("确定要删除这条说说吗？")) return;
    
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("请先登录");
      return;
    }

    const success = await deleteMemo(memoId, token);
    if (success) {
      alert("删除成功！");
      loadMemos(); // 刷新列表
    } else {
      alert("删除失败，请重试");
    }
  };

  // 编辑成功后的回调
  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingMemo(null);
    loadMemos(); // 刷新列表
  };

  // 切换评论展开
  const toggleComments = (memoId: number) => {
    setExpandedComments(expandedComments === memoId ? null : memoId);
  };

  // 分页
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#1a1a1a] transition-colors duration-300">
      {/* 顶部导航 */}
      <Header
        onFriendsClick={() => setShowFriendsModal(true)}
        onLoginClick={() => setShowLoginModal(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

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
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="inline-block w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-[#07c160] rounded-full animate-spin" />
              <p className="mt-2 text-sm">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-base mb-2">{error}</p>
              <button
                onClick={loadMemos}
                className="mt-4 px-4 py-2 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg text-sm transition-colors"
              >
                重新加载
              </button>
            </div>
          ) : memos.length > 0 ? (
            memos.map((memo) => (
              <div key={memo.id}>
                <MemoCard
                  memo={memo}
                  onCommentClick={() => toggleComments(memo.id)}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                  isLoggedIn={isLoggedIn}
                />
                {expandedComments === memo.id && (
                  <div className="bg-gray-50 dark:bg-[#2d2d2d] px-4 py-4 ml-10 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 shadow-sm">
                      <TwikooComments memoId={memo.id} />
                    </div>
                  </div>
                )}
              </div>
            ))
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
          onPageChange={goToPage}
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

      {/* 音乐播放器 */}
      <MusicPlayer />

      {/* Live2D 看板娘 */}
      <Live2DWidget />

      {/* PWA 安装提示 */}
      <PWAInstallPrompt />

      {/* 模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      <FriendsModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
      />

      {/* 编辑说说模态框 */}
      <EditMemoModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingMemo(null);
        }}
        memo={editingMemo}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
