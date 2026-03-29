import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// 数据库查询API - 用于调试
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") || "likes";
    const limit = parseInt(searchParams.get("limit") || "10");
    
    let result;
    
    switch (table) {
      case "likes":
        result = await sql`
          SELECT * FROM likes 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
        break;
      case "count":
        const count = await sql`SELECT COUNT(*) as total FROM likes`;
        result = { total: count[0]?.total || 0 };
        break;
      default:
        return NextResponse.json(
          { error: "Unknown table" },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      table,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[DB Query] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 执行自定义SQL（仅限SELECT）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }
    
    // 只允许SELECT查询
    if (!query.trim().toLowerCase().startsWith('select')) {
      return NextResponse.json(
        { error: "Only SELECT queries are allowed" },
        { status: 403 }
      );
    }
    
    // 执行查询
    const result = await sql.query(query);
    
    return NextResponse.json({
      success: true,
      query,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[DB Query] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
