export interface FriendLink {
  id: number;
  name: string;
  url: string;
  avatar: string;
  description?: string;
  sortOrder: number;
}

// 友链数据 - 可直接编辑此文件添加/修改友链
export const friendLinks: FriendLink[] = [
  {
    id: 1,
    name: "示例网站",
    url: "https://example.com",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=0&s=100",
    description: "这是一个示例网站",
    sortOrder: 0,
  },
  // 添加更多友链...
  // {
  //   id: 2,
  //   name: "朋友博客",
  //   url: "https://friend-blog.com",
  //   avatar: "https://friend-blog.com/avatar.jpg",
  //   description: "好朋友的博客",
  //   sortOrder: 1,
  // },
];

// 按排序值排序
export const getSortedLinks = () => {
  return [...friendLinks].sort((a, b) => a.sortOrder - b.sortOrder);
};
