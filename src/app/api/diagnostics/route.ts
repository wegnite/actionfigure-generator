import { NextRequest, NextResponse } from 'next/server';
import { 
  runNetworkDiagnostics, 
  checkAuthEnvironmentVariables,
  type NetworkDiagnosticResult 
} from '@/lib/network-diagnostics';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 启动认证诊断...');
    
    // 检查环境变量
    const envCheck = checkAuthEnvironmentVariables();
    
    // 运行网络诊断
    const networkDiagnostics = await runNetworkDiagnostics();
    
    // 汇总结果
    const result = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        authUrl: process.env.AUTH_URL,
        webUrl: process.env.NEXT_PUBLIC_WEB_URL,
      },
      configuration: envCheck,
      network: networkDiagnostics,
      recommendations: generateRecommendations(envCheck, networkDiagnostics),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('诊断过程中发生错误:', error);
    return NextResponse.json(
      { 
        error: '诊断失败', 
        message: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  envCheck: ReturnType<typeof checkAuthEnvironmentVariables>,
  networkResults: NetworkDiagnosticResult[]
) {
  const recommendations: string[] = [];

  // 环境变量建议
  if (!envCheck.google.configured) {
    recommendations.push('配置 Google OAuth 环境变量: AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, NEXT_PUBLIC_AUTH_GOOGLE_ID');
  }
  if (!envCheck.github.configured) {
    recommendations.push('配置 GitHub OAuth 环境变量: AUTH_GITHUB_ID, AUTH_GITHUB_SECRET');
  }

  // 网络连接建议
  const googleResult = networkResults.find(r => r.service === 'Google OAuth');
  const githubResult = networkResults.find(r => r.service === 'GitHub OAuth');

  if (googleResult && !googleResult.success) {
    if (googleResult.error?.includes('超时') || googleResult.error?.includes('fetch')) {
      recommendations.push('Google 服务连接失败：考虑使用代理服务器或 VPN');
      recommendations.push('在开发环境中，可以考虑只启用 GitHub 认证作为替代方案');
      recommendations.push('生产环境建议部署到可以访问 Google 服务的服务器（如海外 VPS）');
    }
  }

  if (githubResult && !githubResult.success) {
    recommendations.push('GitHub 服务连接失败：检查网络连接和防火墙设置');
  }

  // 如果所有 OAuth 服务都失败
  if (networkResults.every(r => !r.success)) {
    recommendations.push('所有 OAuth 服务都无法连接：');
    recommendations.push('1. 检查网络连接和代理设置');
    recommendations.push('2. 考虑使用内部认证系统');
    recommendations.push('3. 联系网络管理员检查防火墙规则');
  }

  return recommendations;
}