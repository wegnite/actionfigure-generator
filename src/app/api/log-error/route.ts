import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 在 Cloudflare Workers 中，这会输出到 Workers 日志
    console.error('🚨 Client Error Log:', {
      timestamp: new Date().toISOString(),
      ...body
    });
    
    // 你也可以将错误发送到外部服务，如 Sentry、LogRocket 等
    // await sendToExternalLoggingService(body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully' 
    });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

// 可选：GET 方法用于健康检查
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'error-logging',
    timestamp: new Date().toISOString() 
  });
}