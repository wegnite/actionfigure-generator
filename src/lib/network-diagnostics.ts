/**
 * 网络诊断工具
 * 用于检测网络连接问题并提供诊断信息
 */

export interface NetworkDiagnosticResult {
  success: boolean;
  service: string;
  error?: string;
  suggestion?: string;
  responseTime?: number;
}

/**
 * 测试与 Google OAuth 服务的连接
 */
export async function testGoogleOAuthConnection(): Promise<NetworkDiagnosticResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch('https://accounts.google.com/.well-known/openid_configuration', {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NextAuth.js Network Diagnostic Tool',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        service: 'Google OAuth',
        responseTime,
      };
    } else {
      return {
        success: false,
        service: 'Google OAuth',
        error: `HTTP ${response.status}: ${response.statusText}`,
        suggestion: '检查 Google OAuth 配置或网络连接',
        responseTime,
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    let errorMessage = '';
    let suggestion = '';

    if (error.name === 'AbortError') {
      errorMessage = '连接超时';
      suggestion = '网络连接缓慢或被阻止，建议使用代理或检查防火墙设置';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS 解析失败';
      suggestion = '检查 DNS 设置或网络连接';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = '连接被拒绝';
      suggestion = '网络防火墙或代理设置可能阻止了连接';
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Fetch 失败 - 网络连接问题';
      suggestion = '这通常表示网络环境阻止了对 Google 服务的访问，建议使用代理服务器';
    } else {
      errorMessage = error.message || '未知网络错误';
      suggestion = '检查网络连接和防火墙设置';
    }

    return {
      success: false,
      service: 'Google OAuth',
      error: errorMessage,
      suggestion,
      responseTime,
    };
  }
}

/**
 * 测试与 GitHub OAuth 服务的连接
 */
export async function testGitHubOAuthConnection(): Promise<NetworkDiagnosticResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.github.com/', {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NextAuth.js Network Diagnostic Tool',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        service: 'GitHub OAuth',
        responseTime,
      };
    } else {
      return {
        success: false,
        service: 'GitHub OAuth',
        error: `HTTP ${response.status}: ${response.statusText}`,
        suggestion: '检查 GitHub OAuth 配置',
        responseTime,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      service: 'GitHub OAuth',
      error: error.message || '网络连接失败',
      suggestion: '检查网络连接和防火墙设置',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * 运行完整的网络诊断
 */
export async function runNetworkDiagnostics(): Promise<NetworkDiagnosticResult[]> {
  console.log('🔍 开始网络诊断...');
  
  const diagnostics = await Promise.all([
    testGoogleOAuthConnection(),
    testGitHubOAuthConnection(),
  ]);

  console.log('📊 诊断结果:');
  diagnostics.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.service}: 连接正常 (${result.responseTime}ms)`);
    } else {
      console.log(`❌ ${result.service}: ${result.error}`);
      console.log(`💡 建议: ${result.suggestion}`);
    }
  });

  return diagnostics;
}

/**
 * 环境变量检查
 */
export function checkAuthEnvironmentVariables(): {
  google: { configured: boolean; issues: string[] };
  github: { configured: boolean; issues: string[] };
} {
  const result = {
    google: { configured: false, issues: [] as string[] },
    github: { configured: false, issues: [] as string[] },
  };

  // 检查 Google OAuth 配置
  if (!process.env.AUTH_GOOGLE_ID) {
    result.google.issues.push('AUTH_GOOGLE_ID 未设置');
  }
  if (!process.env.AUTH_GOOGLE_SECRET) {
    result.google.issues.push('AUTH_GOOGLE_SECRET 未设置');
  }
  if (!process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID) {
    result.google.issues.push('NEXT_PUBLIC_AUTH_GOOGLE_ID 未设置');
  }
  if (process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== 'true') {
    result.google.issues.push('NEXT_PUBLIC_AUTH_GOOGLE_ENABLED 未启用');
  }
  
  result.google.configured = result.google.issues.length === 0;

  // 检查 GitHub OAuth 配置
  if (!process.env.AUTH_GITHUB_ID) {
    result.github.issues.push('AUTH_GITHUB_ID 未设置');
  }
  if (!process.env.AUTH_GITHUB_SECRET) {
    result.github.issues.push('AUTH_GITHUB_SECRET 未设置');
  }
  if (process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED !== 'true') {
    result.github.issues.push('NEXT_PUBLIC_AUTH_GITHUB_ENABLED 未启用');
  }
  
  result.github.configured = result.github.issues.length === 0;

  return result;
}