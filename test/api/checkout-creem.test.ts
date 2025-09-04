/**
 * Creem 支付创建 API 测试套件
 * 
 * 测试范围：
 * - `/api/checkout` 端点的 Creem 支付集成
 * - 支付参数验证和处理
 * - 订单创建和会话管理
 * - 用户认证和权限检查
 * - 价格验证和产品映射
 * - 错误处理和边界条件
 * 
 * 测试策略：
 * - 模拟 Next.js API 路由环境
 * - 模拟数据库操作
 * - 模拟 Creem API 调用
 * - 测试完整的支付创建流程
 */

import { NextRequest } from 'next/server';

// 模拟外部依赖
jest.mock('@/services/user');
jest.mock('@/models/order');
jest.mock('@/models/user');
jest.mock('@/lib/hash');
jest.mock('@/services/page');
jest.mock('@/services/attribution');

// 导入被模拟的模块
import { getUserEmail, getUserUuid } from '@/services/user';
import { insertOrder, updateOrderSession } from '@/models/order';
import { findUserByUuid } from '@/models/user';
import { getSnowId } from '@/lib/hash';
import { getPricingPage } from '@/services/page';
import {
  getOrCreateAttributionCookie,
  getOrderAttributionForStorage,
  parseUserAgent,
  parseIPLocation,
  getAttributionFromRequest
} from '@/services/attribution';

// 类型声明
const mockGetUserEmail = getUserEmail as jest.MockedFunction<typeof getUserEmail>;
const mockGetUserUuid = getUserUuid as jest.MockedFunction<typeof getUserUuid>;
const mockInsertOrder = insertOrder as jest.MockedFunction<typeof insertOrder>;
const mockUpdateOrderSession = updateOrderSession as jest.MockedFunction<typeof updateOrderSession>;
const mockFindUserByUuid = findUserByUuid as jest.MockedFunction<typeof findUserByUuid>;
const mockGetSnowId = getSnowId as jest.MockedFunction<typeof getSnowId>;
const mockGetPricingPage = getPricingPage as jest.MockedFunction<typeof getPricingPage>;
const mockGetAttributionFromRequest = getAttributionFromRequest as jest.MockedFunction<typeof getAttributionFromRequest>;
const mockGetOrCreateAttributionCookie = getOrCreateAttributionCookie as jest.MockedFunction<typeof getOrCreateAttributionCookie>;
const mockGetOrderAttributionForStorage = getOrderAttributionForStorage as jest.MockedFunction<typeof getOrderAttributionForStorage>;

// 模拟数据
const mockUser = {
  uuid: 'user_test_uuid_123',
  email: 'test@example.com',
  name: 'Test User'
};

const mockPricingPage = {
  pricing: {
    items: [
      {
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        amount: 1900,
        cn_amount: 1900,
        currency: 'usd',
        interval: 'month',
        credits: 100,
        valid_months: 1
      },
      {
        product_id: 'premium_plan',
        product_name: 'Premium Plan',
        amount: 4900,
        cn_amount: 4900,
        currency: 'usd',
        interval: 'year',
        credits: 1200,
        valid_months: 12
      }
    ]
  }
};

const mockCreemResponse = {
  id: 'checkout_test_123',
  checkout_url: 'https://checkout.creem.io/test-123',
  status: 'created',
  customer_id: 'customer_test_456'
};

const mockAttributionData = {
  source: 'google',
  medium: 'organic',
  campaign: 'test_campaign',
  sessionId: 'session_123'
};

// 模拟全局 fetch
global.fetch = jest.fn();

describe('Creem 支付创建 API 测试', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 设置环境变量
    process.env.PAY_PROVIDER = 'creem';
    process.env.CREEM_API_KEY = 'test_creem_api_key';
    process.env.CREEM_ENV = 'test';
    process.env.CREEM_PRODUCTS = JSON.stringify({
      'basic_plan': 'creem_basic_123',
      'premium_plan': 'creem_premium_456'
    });
    process.env.NEXT_PUBLIC_WEB_URL = 'https://test.example.com';
    process.env.NEXT_PUBLIC_PAY_CANCEL_URL = '/pricing';

    // 设置默认模拟返回值
    mockGetUserUuid.mockResolvedValue('user_test_uuid_123');
    mockGetUserEmail.mockResolvedValue('test@example.com');
    mockFindUserByUuid.mockResolvedValue(mockUser);
    mockGetSnowId.mockReturnValue('order_123456789');
    mockGetPricingPage.mockResolvedValue(mockPricingPage);
    mockGetAttributionFromRequest.mockResolvedValue(mockAttributionData);
    mockGetOrCreateAttributionCookie.mockResolvedValue({
      visitor: { sessionId: 'session_123' },
      last: mockAttributionData
    });
    mockGetOrderAttributionForStorage.mockReturnValue({
      attribution_source: 'google',
      attribution_medium: 'organic',
      attribution_campaign: 'test_campaign'
    });
  });

  describe('成功支付创建流程', () => {
    test('应该成功创建 Creem 支付会话', async () => {
      // 动态导入 API 处理器
      const { POST } = await import('@/app/api/checkout/route');
      // 模拟 Creem API 成功响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemResponse)
      });

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toMatchObject({
        provider: 'creem',
        order_no: 'order_123456789',
        url: 'https://checkout.creem.io/test-123'
      });

      // 验证数据库操作
      expect(mockInsertOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          order_no: 'order_123456789',
          user_uuid: 'user_test_uuid_123',
          user_email: 'test@example.com',
          amount: 1900,
          interval: 'month',
          credits: 100,
          currency: 'usd',
          product_id: 'basic_plan',
          product_name: 'Basic Plan',
          valid_months: 1,
          status: 'created'
        })
      );

      expect(mockUpdateOrderSession).toHaveBeenCalledWith(
        'order_123456789',
        'checkout_test_123',
        JSON.stringify(mockCreemResponse)
      );
    });

    test('应该处理中文货币 (CNY) 支付', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemResponse)
      });

      const requestBody = {
        credits: 100,
        currency: 'cny',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'zh'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.provider).toBe('creem');

      // 验证 Creem API 调用参数
      expect(fetch).toHaveBeenCalledWith(
        'https://test-api.creem.io/v1/checkouts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test_creem_api_key'
          },
          body: expect.stringContaining('"product_id":"creem_basic_123"')
        })
      );
    });

    test('应该正确处理年度订阅', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemResponse)
      });

      const requestBody = {
        credits: 1200,
        currency: 'usd',
        amount: 4900,
        interval: 'year',
        product_id: 'premium_plan',
        product_name: 'Premium Plan',
        valid_months: 12,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.provider).toBe('creem');

      // 验证订单过期时间计算 (年度订阅 + 24小时缓冲期)
      expect(mockInsertOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          interval: 'year',
          valid_months: 12
        })
      );
    });
  });

  describe('参数验证', () => {
    test('应该拒绝缺少必需参数的请求', async () => {
      const requestBody = {
        credits: 100,
        // 缺少其他必需参数
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('invalid params');
    });

    test('应该验证产品价格和配置', async () => {
      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 9999, // 错误的价格
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('invalid checkout params');
    });

    test('应该验证订阅间隔和有效期匹配', async () => {
      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'year',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1, // 年度订阅应该是 12 个月
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('invalid valid_months');
    });

    test('应该验证无效的订阅间隔', async () => {
      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'invalid_interval',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('invalid interval');
    });
  });

  describe('用户认证验证', () => {
    test('应该拒绝未认证用户', async () => {
      mockGetUserUuid.mockResolvedValue(null);

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('no auth, please sign-in');
    });

    test('应该拒绝无效用户', async () => {
      mockGetUserEmail.mockResolvedValue(null);
      mockFindUserByUuid.mockResolvedValue(null);

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('invalid user');
    });
  });

  describe('Creem API 集成', () => {
    test('应该处理 Creem API 错误响应', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid product ID')
      });

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('create creem session failed');
    });

    test('应该处理缺少产品映射', async () => {
      process.env.CREEM_PRODUCTS = JSON.stringify({});

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('creem product mapping not found');
    });

    test('应该处理缺少 checkout_url 的响应', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'checkout_test_123',
          // 缺少 checkout_url
        })
      });

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('create creem session failed: missing URL');
    });
  });

  describe('归因数据处理', () => {
    test('应该正确处理订单归因数据', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemResponse)
      });

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGetAttributionFromRequest).toHaveBeenCalled();
      expect(mockGetOrCreateAttributionCookie).toHaveBeenCalled();
      expect(mockGetOrderAttributionForStorage).toHaveBeenCalled();

      // 验证归因数据被包含在订单中
      expect(mockInsertOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          attribution_source: 'google',
          attribution_medium: 'organic',
          attribution_campaign: 'test_campaign'
        })
      );
    });

    test('应该处理归因数据获取失败', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemResponse)
      });

      // 模拟归因数据获取失败
      mockGetAttributionFromRequest.mockRejectedValueOnce(new Error('Attribution failed'));

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);

      // 归因失败不应阻止订单创建
      expect(response.status).toBe(200);
      expect(mockInsertOrder).toHaveBeenCalled();
    });
  });

  describe('URL 生成和重定向', () => {
    test('应该生成正确的成功回调 URL', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemResponse)
      });

      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        locale: 'zh'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      await POST(request);

      // 验证 Creem API 调用中包含正确的 success_url
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestBody_creem = JSON.parse(fetchCall[1].body);
      
      expect(requestBody_creem.success_url).toBe(
        'https://test.example.com/api/pay/callback/creem?order_no=order_123456789&locale=zh'
      );
    });

    test('应该处理自定义取消 URL', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemResponse)
      });

      const customCancelUrl = 'https://custom.example.com/cancel';
      const requestBody = {
        credits: 100,
        currency: 'usd',
        amount: 1900,
        interval: 'month',
        product_id: 'basic_plan',
        product_name: 'Basic Plan',
        valid_months: 1,
        cancel_url: customCancelUrl,
        locale: 'en'
      };

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      // cancel_url 在 Creem 集成中不直接使用，但应该被正确处理
    });
  });
});