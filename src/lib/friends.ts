import { siteConfig } from "@/config/site";

export interface FriendLink {
  id: number;
  name: string;
  url: string;
  avatar: string;
  description?: string;
  sortOrder: number;
}

// 获取友链列表
export async function getFriends(): Promise<FriendLink[]> {
  const { dataSource, remoteUrl, localData } = siteConfig.friends;

  // 如果使用本地数据
  if (dataSource === "local") {
    return [...localData].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // 如果使用远程数据
  try {
    const response = await fetch(remoteUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("获取远程友链失败:", response.status, response.statusText);
      // 如果远程获取失败，回退到本地数据
      return [...localData].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const data = await response.json();

    // 处理不同格式的友链数据
    if (Array.isArray(data)) {
      // 直接是数组格式
      return data.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.name || item.title || "未命名",
        url: item.url || item.link || "#",
        avatar: item.avatar || item.icon || item.logo || "https://q1.qlogo.cn/g?b=qq&nk=0&s=100",
        description: item.description || item.desc || "",
        sortOrder: item.sortOrder || item.order || index,
      }));
    } else if (data.friends && Array.isArray(data.friends)) {
      // { friends: [...] } 格式
      return data.friends.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.name || item.title || "未命名",
        url: item.url || item.link || "#",
        avatar: item.avatar || item.icon || item.logo || "https://q1.qlogo.cn/g?b=qq&nk=0&s=100",
        description: item.description || item.desc || "",
        sortOrder: item.sortOrder || item.order || index,
      }));
    } else if (data.data && Array.isArray(data.data)) {
      // { data: [...] } 格式
      return data.data.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.name || item.title || "未命名",
        url: item.url || item.link || "#",
        avatar: item.avatar || item.icon || item.logo || "https://q1.qlogo.cn/g?b=qq&nk=0&s=100",
        description: item.description || item.desc || "",
        sortOrder: item.sortOrder || item.order || index,
      }));
    }

    console.error("未知的友链数据格式:", data);
    return [...localData].sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error("获取远程友链失败:", error);
    // 如果远程获取失败，回退到本地数据
    return [...localData].sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
