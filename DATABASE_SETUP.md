# 数据库设置指南

## 本地开发环境

### 1. 安装 PostgreSQL

**Windows:**
- 下载并安装 PostgreSQL: https://www.postgresql.org/download/windows/
- 记住设置的密码

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. 创建数据库

```bash
# 进入 PostgreSQL 命令行
psql -U postgres

# 创建数据库
CREATE DATABASE cfmemos;

# 退出
\q
```

### 3. 配置环境变量

编辑 `.env.local` 文件：

```env
# 本地 PostgreSQL 数据库
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/cfmemos

# 管理员 TOKEN
NEXT_PUBLIC_ADMIN_TOKEN=your_admin_token_here
```

### 4. 启动开发服务器

```bash
npm run dev
```

首次访问时，系统会自动创建点赞表。

## 生产环境部署

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   - `DATABASE_URL`: Neon 数据库连接字符串
   - `NEXT_PUBLIC_ADMIN_TOKEN`: 管理员 TOKEN

2. 重新部署项目

### Netlify 部署

1. 在 Netlify 项目设置 → Environment variables 中添加：
   - `DATABASE_URL`
   - `NEXT_PUBLIC_ADMIN_TOKEN`

2. 重新部署

## 环境变量文件说明

| 文件 | 用途 | 是否提交到 Git |
|------|------|---------------|
| `.env.local` | 本地开发环境 | ❌ 否 |
| `.env.production` | 生产环境模板 | ✅ 是（不含敏感信息） |
| `.env` | 通用环境变量 | ❌ 否 |

## 切换数据库

### 本地开发使用 Neon 数据库

临时修改 `.env.local`：
```env
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 本地开发使用本地数据库

保持 `.env.local`：
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cfmemos
```
