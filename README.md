# CFMemos Next.js 朋友圈

基于 Next.js 16 + TypeScript + Tailwind CSS 重构的朋友圈应用。

## 功能特性

- 📱 响应式设计，移动端优先
- 🌙 深色模式支持
- 📝 说说发布与展示
- 💬 Twikoo 评论系统集成
- 🔗 友链展示（支持本地/远程数据源）
- 🎵 音乐播放器
- 🤖 Live2D 看板娘
- 🖱️ 自定义鼠标样式
- 📡 RSS 订阅
- ⚡ 支持 Vercel / EdgeOne 部署

## 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **评论**: Twikoo
- **API**: Cloudflare Memos API

## 快速开始

### 1. 安装依赖

```bash
cd cfmemos-next
npm install
```

### 2. 配置

编辑 `src/config/site.ts` 文件，修改以下配置：

```typescript
export const siteConfig = {
  title: "你的网站标题",
  description: "网站描述",
  url: "https://your-domain.com",
  author: {
    name: "你的名字",
    avatar: "头像链接",
    background: "背景图链接",
    signature: "个性签名",
  },
  api: {
    baseUrl: "https://your-api-domain/api/v1",
  },
  twikoo: {
    envId: "your-twikoo-env-id", // 替换为你的 Twikoo 环境 ID
  },
  // 友链配置
  friends: {
    dataSource: "remote", // 'local' 或 'remote'
    remoteUrl: "https://your-domain.com/friends.json",
    localData: [...], // 本地友链数据
  },
};
```

### 3. 配置友链

支持两种友链数据源：

**本地数据**：在 `src/config/site.ts` 中配置 `localData`

**远程 API**：配置 `dataSource: "remote"` 和 `remoteUrl`

### 4. 开发

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建

```bash
npm run build
```

## 部署

### 后端部署

本项目需要配合后端 API 使用，后端仓库地址：

**https://github.com/yxksw/cfmemos/tree/main/backend**

后端技术栈：
- 运行时：Cloudflare Workers
- 框架：Hono.js
- 数据库：Cloudflare D1 (SQLite)
- 存储：Cloudflare R2 (S3 兼容)

部署步骤：
1. 克隆后端仓库
2. 配置 wrangler.toml
3. 部署到 Cloudflare Workers
4. 初始化 D1 数据库
5. 在前端配置中设置 `api.baseUrl`

详细后端部署文档请参考：[backend/README.md](https://github.com/yxksw/cfmemos/tree/main/backend)

### 前端部署

#### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（如需要）
4. 自动部署

#### EdgeOne Pages 部署

1. 将代码推送到 GitHub
2. 在 EdgeOne Pages 创建项目
3. 构建设置：
   - 构建命令: `npm run build`
   - 输出目录: `dist`
4. 部署

## 项目结构

```
cfmemos-next/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # 首页
│   │   ├── post/         # 发表说说页面
│   │   ├── rss.xml/      # RSS 路由
│   │   └── layout.tsx    # 根布局
│   ├── components/       # 组件
│   │   ├── Header.tsx
│   │   ├── Cover.tsx
│   │   ├── MemoCard.tsx
│   │   ├── Footer.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── TwikooComments.tsx
│   │   ├── Live2DWidget.tsx    # Live2D 看板娘
│   │   ├── Pagination.tsx      # 分页组件
│   │   └── modals/             # 模态框组件
│   ├── config/           # 配置文件
│   │   └── site.ts       # 站点配置
│   ├── data/             # 本地数据
│   │   └── links.ts      # 友链数据（可选）
│   ├── lib/              # 工具函数
│   │   ├── api.ts        # API 封装
│   │   ├── friends.ts    # 友链 API
│   │   └── utils.ts      # 工具函数
│   └── types/            # TypeScript 类型
│       └── memo.ts
├── public/               # 静态资源
│   ├── cursor.ico        # 自定义鼠标样式
│   └── default.cur       # 自定义鼠标样式（备用）
├── next.config.ts        # Next.js 配置
├── vercel.json           # Vercel 配置
└── package.json
```

## API 接口

项目使用 Cloudflare Memos API：

- `GET /api/v1/memo` - 获取说说列表
- `POST /api/v1/memo` - 创建说说
- `PUT /api/v1/memo/:id` - 更新说说
- `DELETE /api/v1/memo/:id` - 删除说说
- `POST /api/v1/resource` - 上传资源
- `GET /api/v1/user` - 获取用户信息
- `POST /api/v1/user/login` - 用户登录

完整 API 文档请参考后端仓库：[backend/README.md](https://github.com/yxksw/cfmemos/tree/main/backend)

## 配置说明

### 主题配置

支持浅色/深色/跟随系统三种模式，通过顶部导航栏的主题切换按钮切换。

### 友链配置

在 `src/config/site.ts` 中配置：

```typescript
friends: {
  // 数据源: 'local' 使用本地数据, 'remote' 使用远程 API
  dataSource: "remote",
  // 远程 API 地址
  remoteUrl: "https://cdn.jsdmirror.com/gh/yxksw/Friends@main/data/friends.json",
  // 本地友链数据（当远程获取失败时作为备用）
  localData: [...],
}
```

### 评论配置

使用 Twikoo 评论系统，在 `src/config/site.ts` 中配置：

```typescript
twikoo: {
  envId: "https://your-twikoo-domain.com", // Twikoo 环境 ID 或 URL
  region: "ap-shanghai", // 腾讯云区域（可选）
}
```

### 音乐播放器配置

```typescript
music: {
  enabled: true,
  api: "https://meting-api.example.com/api?server=netease&type=playlist&id=YOUR_PLAYLIST_ID",
}
```

## 许可证

MIT
