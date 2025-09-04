'use client';

import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  const testGoogleAuth = async () => {
    try {
      console.log('尝试 Google OAuth 登录...');
      await signIn('google', { 
        callbackUrl: '/test-auth',
        redirect: true 
      });
    } catch (error) {
      console.error('Google OAuth 登录失败:', error);
    }
  };

  const testGoogleOneTap = async () => {
    try {
      console.log('尝试 Google One-Tap 登录...');
      await signIn('google-one-tap', { 
        callbackUrl: '/test-auth',
        redirect: true 
      });
    } catch (error) {
      console.error('Google One-Tap 登录失败:', error);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            NextAuth.js Google OAuth 测试页面
          </CardTitle>
          <CardDescription className="text-center">
            用于测试和诊断 Google OAuth 配置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 当前会话状态 */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              会话状态
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'authenticated' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {status === 'unauthenticated' && <XCircle className="w-4 h-4 text-red-500" />}
            </h3>
            
            <div className="space-y-2">
              <p><strong>状态:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  status === 'authenticated' ? 'bg-green-100 text-green-800' :
                  status === 'unauthenticated' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {status}
                </span>
              </p>
              
              {session?.user && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p><strong>用户信息:</strong></p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li><strong>姓名:</strong> {session.user.name}</li>
                    <li><strong>邮箱:</strong> {session.user.email}</li>
                    <li><strong>头像:</strong> 
                      {session.user.image && (
                        <img src={session.user.image} alt="Avatar" className="inline w-8 h-8 rounded-full ml-2" />
                      )}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 配置信息显示 */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">当前配置信息</h3>
            <div className="space-y-2 text-sm font-mono">
              <p><strong>Client ID:</strong> 514747872059-mmhalp3i65h4emqr4fpreu3e7g0odah0.apps.googleusercontent.com</p>
              <p><strong>重定向 URI:</strong> {window.location.origin}/api/auth/callback/google</p>
              <p><strong>当前 URL:</strong> {window.location.href}</p>
              <p><strong>NextAuth URL:</strong> {window.location.origin}/api/auth</p>
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">OAuth 测试</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={testGoogleAuth}
                className="w-full"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                测试 Google OAuth 登录
              </Button>
              
              <Button 
                onClick={testGoogleOneTap}
                variant="outline"
                className="w-full"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                测试 Google One-Tap 登录
              </Button>
            </div>
          </div>

          {/* 故障排查提示 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              故障排查提示
            </h3>
            <ul className="text-sm space-y-2">
              <li>• 确保在 Google Cloud Console 中添加了重定向 URI: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/api/auth/callback/google</code></li>
              <li>• 检查 OAuth 同意屏幕是否已正确配置</li>
              <li>• 确认 People API 已启用</li>
              <li>• 如果是外部应用，确保已添加测试用户或发布了应用</li>
              <li>• 查看浏览器开发者工具的 Network 标签获取详细错误信息</li>
            </ul>
          </div>

          {/* 手动测试链接 */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">手动测试链接</h3>
            <p className="text-sm mb-2">如果上面的按钮不工作，请尝试点击以下链接进行手动测试：</p>
            <a 
              href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=514747872059-mmhalp3i65h4emqr4fpreu3e7g0odah0.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/google')}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=consent`}
              className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              点击这里进行手动 Google OAuth 测试
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}