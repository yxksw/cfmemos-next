"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { loginUser, deleteMemo } from "@/lib/api";
import type { Memo } from "@/types/memo";

import LoginModal from "@/components/modals/LoginModal";
import FriendsModal from "@/components/modals/FriendsModal";
import EditMemoModal from "@/components/modals/EditMemoModal";
import SearchModal from "@/components/modals/SearchModal";

// 服务端快照缓存 - 避免无限循环
const serverSnapshot = { token: "", isLoggedIn: false };

// 客户端快照缓存
let clientSnapshot = { token: "", isLoggedIn: false };

// 创建简单的 auth store
const authStore = {
  token: "",
  isLoggedIn: false,
  listeners: new Set<() => void>(),
  
  getToken() {
    if (typeof window === 'undefined') return "";
    return localStorage.getItem("auth_token") || "";
  },
  
  getIsLoggedIn() {
    return !!this.getToken();
  },
  
  setToken(token: string) {
    this.token = token;
    this.isLoggedIn = !!token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
    // 更新缓存的快照
    clientSnapshot = { token: this.token, isLoggedIn: this.isLoggedIn };
    this.listeners.forEach(listener => listener());
  },
  
  subscribe(listener: () => void) {
    // 初始化时更新缓存
    const token = this.getToken();
    clientSnapshot = { token, isLoggedIn: !!token };
    
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  getSnapshot() {
    const token = this.getToken();
    const isLoggedIn = !!token;
    
    // 如果值没有变化，返回缓存的快照
    if (clientSnapshot.token === token && clientSnapshot.isLoggedIn === isLoggedIn) {
      return clientSnapshot;
    }
    
    // 更新缓存
    clientSnapshot = { token, isLoggedIn };
    return clientSnapshot;
  }
};

// 自定义 hook 用于获取 auth 状态
function useAuth() {
  return useSyncExternalStore(
    (callback) => authStore.subscribe(callback),
    () => authStore.getSnapshot(),
    () => serverSnapshot
  );
}

export default function ClientHome() {
  const router = useRouter();
  const { token: authToken, isLoggedIn } = useAuth();

  // 模态框状态
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  // 监听打开模态框事件
  useEffect(() => {
    const handleOpenLogin = () => setShowLoginModal(true);
    const handleOpenFriends = () => setShowFriendsModal(true);
    const handleOpenSearch = () => setShowSearchModal(true);

    window.addEventListener('open-login-modal', handleOpenLogin);
    window.addEventListener('open-friends-modal', handleOpenFriends);
    window.addEventListener('open-search-modal', handleOpenSearch);

    return () => {
      window.removeEventListener('open-login-modal', handleOpenLogin);
      window.removeEventListener('open-friends-modal', handleOpenFriends);
      window.removeEventListener('open-search-modal', handleOpenSearch);
    };
  }, []);

  // 处理登录
  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await loginUser(username, password);
      if (result && result.token) {
        authStore.setToken(result.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // 处理退出
  const handleLogout = () => {
    authStore.setToken("");
  };

  // 处理编辑说说
  const handleEditClick = (memo: Memo) => {
    setEditingMemo(memo);
    setShowEditModal(true);
  };

  // 处理删除说说
  const handleDeleteClick = async (memoId: number) => {
    if (!confirm("确定要删除这条说说吗？")) return;

    if (!authToken) {
      alert("请先登录");
      return;
    }

    const success = await deleteMemo(memoId, authToken);
    if (success) {
      alert("删除成功！");
      // 触发重新验证
      await fetch("/api/revalidate", { method: "POST" });
      router.refresh();
    } else {
      alert("删除失败，请重试");
    }
  };

  // 编辑成功后的回调
  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingMemo(null);
    // 触发重新验证
    fetch("/api/revalidate", { method: "POST" }).then(() => {
      router.refresh();
    });
  };

  // 将 handleLogout 和 handleEditClick 暴露给 Header 组件
  useEffect(() => {
    (window as any).__clientHomeHandlers = {
      handleLogout,
      handleEditClick
    };
  }, [handleLogout, handleEditClick]);

  return (
    <>
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

      {/* 搜索模态框 */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
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
    </>
  );
}
