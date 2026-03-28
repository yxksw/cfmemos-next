import { NextRequest, NextResponse } from "next/server";
import { sql, initLikesTable } from "@/lib/db";

// 获取用户指纹（基于 IP 和 User-Agent 的简单哈希）
function getUserFingerprint(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for") ||
             request.headers.get("x-real-ip") ||
             "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  
  // 简单的字符串组合作为指纹
  const fingerprint = `${ip}:${userAgent}`;
  
  // 使用简单的哈希（实际生产环境可以使用更安全的哈希算法）
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}

// GET /api/likes?memoId=123 - 获取说说的点赞数和当前用户是否点赞
export async function GET(request: NextRequest) {
  try {
    // 初始化表（首次运行时）
    await initLikesTable();
    
    const { searchParams } = new URL(request.url);
    const memoId = searchParams.get("memoId");
    
    if (!memoId) {
      return NextResponse.json(
        { error: "Missing memoId parameter" },
        { status: 400 }
      );
    }
    
    const userFingerprint = getUserFingerprint(request);
    
    // 获取点赞总数
    const countResult = await sql`
      SELECT COUNT(*) as count FROM likes WHERE memo_id = ${memoId}
    `;
    const count = parseInt(countResult[0]?.count || "0");
    
    // 检查当前用户是否已点赞
    const userLikeResult = await sql`
      SELECT id FROM likes 
      WHERE memo_id = ${memoId} AND user_fingerprint = ${userFingerprint}
    `;
    const hasLiked = userLikeResult.length > 0;
    
    return NextResponse.json({
      count,
      hasLiked,
    });
  } catch (error) {
    console.error("[API] Error getting likes:", error);
    return NextResponse.json(
      { error: "Failed to get likes" },
      { status: 500 }
    );
  }
}

// POST /api/likes - 点赞或取消点赞
export async function POST(request: NextRequest) {
  try {
    await initLikesTable();
    
    const body = await request.json();
    const { memoId, action } = body;
    
    if (!memoId || !action) {
      return NextResponse.json(
        { error: "Missing memoId or action" },
        { status: 400 }
      );
    }
    
    if (action !== "like" && action !== "unlike") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'like' or 'unlike'" },
        { status: 400 }
      );
    }
    
    const userFingerprint = getUserFingerprint(request);
    
    if (action === "like") {
      // 尝试插入点赞记录（如果已存在会报错，因为设置了 UNIQUE 约束）
      try {
        await sql`
          INSERT INTO likes (memo_id, user_fingerprint)
          VALUES (${memoId}, ${userFingerprint})
        `;
      } catch (error) {
        // 如果是因为唯一约束冲突，说明用户已经点过赞了
        return NextResponse.json(
          { error: "Already liked" },
          { status: 409 }
        );
      }
    } else {
      // 取消点赞 - 使用 try-catch 捕获可能的错误
      try {
        await sql`
          DELETE FROM likes 
          WHERE memo_id = ${memoId} AND user_fingerprint = ${userFingerprint}
        `;
      } catch (error) {
        console.error("[API] Error deleting like:", error);
        // 取消点赞失败不影响返回，可能是记录不存在
      }
    }
    
    // 获取最新的点赞数
    const countResult = await sql`
      SELECT COUNT(*) as count FROM likes WHERE memo_id = ${memoId}
    `;
    const count = parseInt(countResult[0]?.count || "0");
    
    return NextResponse.json({
      success: true,
      count,
      hasLiked: action === "like",
    });
  } catch (error) {
    console.error("[API] Error updating like:", error);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 }
    );
  }
}
