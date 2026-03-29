import { siteConfig } from "@/config/site";
import type { Memo, CreateMemoRequest, UpdateMemoRequest, ApiResponse } from "@/types/memo";

const API_BASE = siteConfig.api.baseUrl;

// 请求缓存
type CacheData = Memo[] | Memo | boolean | null;
interface CacheEntry {
  data: CacheData;
  timestamp: number;
}
const requestCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 通用请求函数
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  useCache: boolean = false
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // 检查缓存
  if (useCache && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return { data: cached.data as T };
    }
    requestCache.delete(cacheKey);
  }
  
  try {
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        error: error.error || `HTTP ${response.status}`,
        code: error.code || "UNKNOWN_ERROR",
      };
    }

    const data = await response.json();
    
    // 缓存数据
    if (useCache) {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return { data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        error: "请求超时，请稍后重试",
        code: "TIMEOUT_ERROR",
      };
    }
    return {
      error: error instanceof Error ? error.message : "网络请求失败",
      code: "NETWORK_ERROR",
    };
  }
}

// 清除缓存
export function clearApiCache() {
  requestCache.clear();
}

// 获取说说列表（带缓存）
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
  
  // 第一页数据使用缓存
  const useCache = !params?.offset || params.offset === 0;
  const response = await fetchApi<Memo[]>(endpoint, {}, useCache);
  
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

// 搜索选项接口
export interface SearchOptions {
  content?: boolean;  // 搜索内容
  tags?: boolean;     // 搜索标签
  username?: boolean; // 搜索用户名
}

// 搜索说说 - 支持多维度搜索
export async function searchMemos(
  query: string,
  options: SearchOptions = { content: true, tags: true, username: true }
): Promise<Memo[]> {
  const params = new URLSearchParams();
  params.append('q', query);
  
  // 根据文档添加搜索维度参数
  if (options.content) params.append('content', 'true');
  if (options.tags) params.append('tags', 'true');
  if (options.username) params.append('username', 'true');
  
  const endpoint = `/memo/search?${params.toString()}`;
  
  const response = await fetchApi<Memo[]>(endpoint);
  
  if (response.error) {
    return [];
  }
  
  // 如果后端返回结果，使用后端结果
  if (response.data && response.data.length > 0) {
    return response.data;
  }
  
  // 后端返回空数组，尝试前端本地搜索
  return localSearchMemos(query);
}

// 前端本地搜索 - 获取所有说说并在前端过滤
async function localSearchMemos(query: string): Promise<Memo[]> {
  try {
    // 获取所有说说（限制100条）
    const allMemos = await getMemos({ limit: 100 });
    
    const lowerQuery = query.toLowerCase();
    const results = allMemos.filter(memo => {
      // 搜索内容
      if (memo.content.toLowerCase().includes(lowerQuery)) return true;
      // 搜索标签
      if (memo.tagList?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
      // 搜索作者
      if (memo.creatorName?.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });
    
    console.log("前端本地搜索结果:", results.length, "条");
    return results;
  } catch (error) {
    console.error("前端本地搜索失败:", error);
    return [];
  }
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
