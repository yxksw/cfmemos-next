import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// ISR 重新验证 API
export async function POST(request: NextRequest) {
  try {
    // 重新验证首页
    revalidatePath("/");
    
    return NextResponse.json({ 
      revalidated: true, 
      message: "页面已重新验证" 
    });
  } catch (error) {
    console.error("重新验证失败:", error);
    return NextResponse.json(
      { 
        revalidated: false, 
        message: "重新验证失败" 
      },
      { status: 500 }
    );
  }
}

// 支持 GET 请求（用于测试）
export async function GET(request: NextRequest) {
  try {
    revalidatePath("/");
    
    return NextResponse.json({ 
      revalidated: true, 
      message: "页面已重新验证" 
    });
  } catch (error) {
    console.error("重新验证失败:", error);
    return NextResponse.json(
      { 
        revalidated: false, 
        message: "重新验证失败" 
      },
      { status: 500 }
    );
  }
}
