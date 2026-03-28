export const siteConfig = {
  // 网站基础配置
  title: "异飨客的朋友圈",
  description: "记录生活中的点点滴滴",
  url: "https://moment.050815.xyz",
  
  // 博主信息
  author: {
    name: "异飨客",
    username: "yxk",
    email: "yxksw@foxmail.com",
    avatar: "https://cn.cravatar.com/avatar/56cd72b5460ecaa08ddffea9562f5629?size=512",
    background: "https://cdn.jsdmirror.com/gh/zsxcoder/github-img@main/img/default-light.avif",
    signature: "每一段旅行，都有终点。",
  },
  
  // API 配置
  api: {
    baseUrl: "https://meow-api.zsx815.top/api/v1",
    timeout: 10000,
  },
  
  // Twikoo 评论配置
  twikoo: {
    envId: "https://cf-memos-twikoo.050815.xyz", // 替换为你的 Twikoo 环境 ID
    region: "ap-shanghai", // 腾讯云区域，可选
  },
  
  // 音乐播放器配置
  music: {
    enabled: true,
    api: "https://meting2.050815.xyz/api?server=netease&type=playlist&id=13681647281",
  },
  
  // RSS 配置
  rss: {
    enabled: true,
    title: "异飨客的朋友圈",
    description: "记录生活中的点点滴滴",
  },
  
  // 分页配置
  pagination: {
    pageSize: 10,
  },

  // 友链配置
  friends: {
    // 数据源: 'local' 使用本地数据, 'remote' 使用远程 API
    dataSource: "remote" as "local" | "remote",
    // 远程 API 地址
    remoteUrl: "https://cdn.jsdmirror.com/gh/yxksw/Friends@main/data/friends.json",
    // 本地友链数据（当 dataSource 为 'local' 时使用）
    localData: [
      {
        id: 1,
        name: "示例网站",
        url: "https://example.com",
        avatar: "https://q1.qlogo.cn/g?b=qq&nk=0&s=100",
        description: "这是一个示例网站",
        sortOrder: 0,
      },
    ],
  },

  // 管理员 TOKEN（用于写说说权限验证）
  // 从环境变量读取，格式: ADMIN_TOKEN=your_token_here
  adminToken: process.env.NEXT_PUBLIC_ADMIN_TOKEN || "",
};

export type SiteConfig = typeof siteConfig;
