import { siteConfig } from "@/config/site";
import type { Memo, CreateMemoRequest, UpdateMemoRequest, ApiResponse } from "@/types/memo";

const API_BASE = siteConfig.api.baseUrl;

// 通用请求函数
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        error: error.error || `HTTP ${response.status}`,
        code: error.code || "UNKNOWN_ERROR",
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "网络请求失败",
      code: "NETWORK_ERROR",
    };
  }
}

// 获取说说列表
export async function getMemos(params?: {
  limit?: number;
  offset?: number;
  creatorId?: number;
}): Promise<Memo[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.offset) searchParams.append("offset", params.offset.toString());
  if (params?.creatorId) searchParams.append("creatorId", params.creatorId.toString());
  
  const query = searchParams.toString();
  const endpoint = `/memo${query ? `?${query}` : ""}`;
  
  const response = await fetchApi<Memo[]>(endpoint);
  
  if (response.error) {
    console.error("获取说说列表失败:", response.error);
    return [];
  }
  
  return response.data || [];
}

// 获取单条说说
export async function getMemoById(id: number): Promise<Memo | null> {
  const response = await fetchApi<Memo>(`/memo/${id}`);
  
  if (response.error) {
    console.error("获取说说详情失败:", response.error);
    return null;
  }
  
  return response.data || null;
}

// 创建说说（需要认证）
export async function createMemo(
  data: CreateMemoRequest,
  token: string
): Promise<Memo | null> {
  const response = await fetchApi<Memo>("/memo", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (response.error) {
    console.error("创建说说失败:", response.error);
    return null;
  }
  
  return response.data || null;
}

// 更新说说（需要认证）
export async function updateMemo(
  id: number,
  data: UpdateMemoRequest,
  token: string
): Promise<Memo | null> {
  const response = await fetchApi<Memo>(`/memo/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (response.error) {
    console.error("更新说说失败:", response.error);
    return null;
  }
  
  return response.data || null;
}

// 删除说说（需要认证）
export async function deleteMemo(
  id: number,
  token: string
): Promise<boolean> {
  const response = await fetchApi<void>(`/memo/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  
  if (response.error) {
    console.error("删除说说失败:", response.error);
    return false;
  }
  
  return true;
}

// 搜索说说
export async function searchMemos(query: string): Promise<Memo[]> {
  const response = await fetchApi<Memo[]>(`/memo/search?q=${encodeURIComponent(query)}`);
  
  if (response.error) {
    console.error("搜索说说失败:", response.error);
    return [];
  }
  
  return response.data || [];
}

// 获取统计数据
export async function getMemoStats(token: string): Promise<{
  total: number;
  public: number;
  private: number;
} | null> {
  const response = await fetchApi<{
    total: number;
    public: number;
    private: number;
  }>("/memo/stats", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  
  if (response.error) {
    console.error("获取统计数据失败:", response.error);
    return null;
  }
  
  return response.data || null;
}

// 上传资源（需要认证）
export async function uploadResource(
  file: File,
  token: string
): Promise<{ id: number; url: string } | null> {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const response = await fetch(`${API_BASE}/resource`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("上传资源失败:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("上传资源失败:", error);
    return null;
  }
}

// 用户登录
export async function loginUser(
  username: string,
  password: string
): Promise<{ token: string; user: { id: number; username: string; name: string } } | null> {
  const response = await fetchApi<{
    token: string;
    user: { id: number; username: string; name: string };
  }>("/user/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (response.error) {
    console.error("登录失败:", response.error);
    return null;
  }

  return response.data || null;
}

// 用户登出
export async function logoutUser(token: string): Promise<boolean> {
  const response = await fetchApi<void>("/user/logout", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (response.error) {
    console.error("登出失败:", response.error);
    return false;
  }

  return true;
}

// 获取当前登录用户信息
export async function getCurrentUser(token: string): Promise<{
  id: number;
  username: string;
  name: string;
  email?: string;
} | null> {
  const response = await fetchApi<{
    id: number;
    username: string;
    name: string;
    email?: string;
  }>("/user/me", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (response.error) {
    console.error("获取用户信息失败:", response.error);
    return null;
  }

  return response.data || null;
}
