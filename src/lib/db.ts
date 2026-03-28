import { neon } from "@neondatabase/serverless";

// 从环境变量获取数据库连接字符串
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// 创建数据库连接
export const sql = neon(DATABASE_URL);

// 初始化点赞表
export async function initLikesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        memo_id INTEGER NOT NULL,
        user_fingerprint VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(memo_id, user_fingerprint)
      )
    `;
    console.log("[DB] Likes table initialized");
  } catch (error) {
    console.error("[DB] Failed to initialize likes table:", error);
  }
}
