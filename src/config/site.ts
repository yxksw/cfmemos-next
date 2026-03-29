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
    enabled: false,
    api: "https://meting2.050815.xyz/api?server=netease&type=playlist&id=13681647281",
  },

  // 新音乐播放器配置（简化版）
  newMusicPlayer: {
    enabled: true, // 暂时禁用，需要配置支持CORS的音频源
    // 支持网易云音乐ID（纯数字）或自定义音乐链接
    // 重要：音频文件必须支持CORS跨域，否则会被浏览器阻止
    // 推荐方案：
    // 1. 使用自己的服务器或CDN（如七牛云、阿里云OSS）
    // 2. 使用支持音频流的服务
    // 3. GitHub/jsDelivr 等可能因跨域策略无法播放
    musicUrl: "https://cdn.261770.xyz/music/%E4%B8%80%E5%8F%A5%E8%AF%9D%E5%BD%A2%E5%AE%B9%E4%B8%8D%E4%BA%86%E7%BB%88%E6%9E%81%E7%AC%94%E8%AE%B0%20-%20%E5%BA%94%E6%9C%89%E6%A3%A0%E3%80%81%E5%8F%B6%E8%90%BD%E6%A2%A6%E4%B8%AD%E3%80%81%E7%BB%AF%E8%A8%80%E3%80%81%E5%B0%8F%E5%B1%B1xl%E3%80%81%E9%9C%84%E9%95%81%E3%80%81%E9%83%AD%E6%9B%A6%E9%98%B3%E3%80%81%E5%A0%87%E5%A2%A8%E5%AE%89%E6%AD%8C%E3%80%81%E5%A4%A9%E7%BD%97.mp3", // 使用HTTPS
  },

  // Live2D 看板娘配置
  live2d: {
    enabled: true,
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

  // PWA 配置
  pwa: {
    // 是否启用 PWA 离线功能
    enabled: true,
    // 离线页面标题
    offlineTitle: "离线模式",
    // 离线页面描述
    offlineDescription: "您当前处于离线状态，部分功能可能无法使用",
    // 是否显示离线提示
    showOfflineToast: true,
  },

  // 点赞功能配置
  likes: {
    // 是否启用点赞功能
    enabled: true,
    // 点赞按钮位置: 'left' 评论左边, 'right' 评论右边
    position: "left" as "left" | "right",
  },
};

export type SiteConfig = typeof siteConfig;
