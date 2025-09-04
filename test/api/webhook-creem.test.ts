/**
 * Creem Webhook 处理测试套件
 * 
 * 测试范围：
 * - Creem Webhook 签名验证
 * - 支付回调处理和订单状态更新
 * - 积分充值和推荐奖励处理
 * - 支付成功页面重定向
 * - 错误处理和安全机制
 * - 幂等性保证
 * 
 * 测试方法：
 * - 模拟 Creem Webhook 请求
 * - 验证 HMAC SHA256 签名
 * - 测试订单处理业务逻辑
 * - 验证错误和边界条件
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';

// 模拟外部依赖
jest.mock('@/services/order');
jest.mock('@/lib/resp');

// 导入被模拟的模块
import { handleOrderPaid } from '@/services/order';
import { respOk } from '@/lib/resp';

// 类型声明
const mockHandleOrderPaid = handleOrderPaid as jest.MockedFunction<typeof handleOrderPaid>;
const mockRespOk = respOk as jest.MockedFunction<typeof respOk>;

// 模拟数据
const mockWebhookEvent = {
  type: 'checkout.completed',
  object: {
    id: 'checkout_test_123',
    status: 'completed',
    amount: 1900,
    currency: 'usd',
    customer: {
      id: 'customer_test_456',
      email: 'test@example.com',
      name: 'Test User'
    },
    metadata: {
      order_no: 'order_test_123456',
      product_id: 'basic_plan',
      product_name: 'Basic Plan',
      credits: '100',
      user_uuid: 'user_test_uuid_123',
      user_email: 'test@example.com'
    }
  }
};

const mockCustomerResponse = {
  id: 'customer_test_456',
  email: 'test@example.com',
  name: 'Test User',
  created_at: '2024-01-01T00:00:00Z'
};

// 模拟全局 fetch
global.fetch = jest.fn();

// 辅助函数：生成有效的 Webhook 签名
function generateValidSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

describe('Creem Webhook 处理测试', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 设置环境变量
    process.env.CREEM_WEBHOOK_SECRET = 'test_webhook_secret';
    process.env.CREEM_API_KEY = 'test_creem_api_key';
    process.env.CREEM_ENV = 'test';
    process.env.NEXT_PUBLIC_WEB_URL = 'https://test.example.com';
    process.env.NEXT_PUBLIC_PAY_SUCCESS_URL = '/pay-success';
    process.env.NEXT_PUBLIC_PAY_FAIL_URL = '/pay-failed';

    // 设置默认模拟返回值
    mockHandleOrderPaid.mockResolvedValue(undefined);
    mockRespOk.mockReturnValue(new Response('OK', { status: 200 }));
  });

  describe('Webhook 通知处理', () => {
    test('应该成功处理有效的 Webhook 通知', async () => {
      const webhookBody = JSON.stringify(mockWebhookEvent);
      const validSignature = generateValidSignature(webhookBody, process.env.CREEM_WEBHOOK_SECRET!);

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(200);
      expect(mockHandleOrderPaid).toHaveBeenCalledWith(
        'order_test_123456',
        mockWebhookEvent.object,
        'test@example.com'
      );
    });

    test('应该拒绝无效签名的请求', async () => {
      const webhookBody = JSON.stringify(mockWebhookEvent);
      const invalidSignature = 'invalid_signature_hash';

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': invalidSignature
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });

    test('应该拒绝缺少签名头的请求', async () => {
      const webhookBody = JSON.stringify(mockWebhookEvent);

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // 缺少 creem-signature 头
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });

    test('应该处理缺少 Webhook 密钥的情况', async () => {
      delete process.env.CREEM_WEBHOOK_SECRET;

      const webhookBody = JSON.stringify(mockWebhookEvent);
      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': 'some_signature'
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });

    test('应该处理缺少订单号的 Webhook 事件', async () => {
      const eventWithoutOrderNo = {
        ...mockWebhookEvent,
        object: {
          ...mockWebhookEvent.object,
          metadata: {
            ...mockWebhookEvent.object.metadata,
            order_no: undefined
          }
        }
      };

      const webhookBody = JSON.stringify(eventWithoutOrderNo);
      const validSignature = generateValidSignature(webhookBody, process.env.CREEM_WEBHOOK_SECRET!);

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });

    test('应该处理无效的 JSON 请求体', async () => {
      const invalidJson = 'invalid json body';
      const validSignature = generateValidSignature(invalidJson, process.env.CREEM_WEBHOOK_SECRET!);

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: invalidJson
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });

    test('应该从客户或元数据中提取邮箱', async () => {
      // 测试从客户信息中提取邮箱
      const eventWithCustomerEmail = {
        ...mockWebhookEvent,
        object: {
          ...mockWebhookEvent.object,
          customer: {
            ...mockWebhookEvent.object.customer,
            email: 'customer@example.com'
          },
          metadata: {
            ...mockWebhookEvent.object.metadata,
            user_email: 'metadata@example.com'
          }
        }
      };

      const webhookBody = JSON.stringify(eventWithCustomerEmail);
      const validSignature = generateValidSignature(webhookBody, process.env.CREEM_WEBHOOK_SECRET!);

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: webhookBody
      });

      await notifyHandler(request);

      // 应该优先使用客户信息中的邮箱
      expect(mockHandleOrderPaid).toHaveBeenCalledWith(
        'order_test_123456',
        eventWithCustomerEmail.object,
        'customer@example.com'
      );
    });

    test('应该处理订单处理失败', async () => {
      mockHandleOrderPaid.mockRejectedValueOnce(new Error('Order processing failed'));

      const webhookBody = JSON.stringify(mockWebhookEvent);
      const validSignature = generateValidSignature(webhookBody, process.env.CREEM_WEBHOOK_SECRET!);

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).toHaveBeenCalled();
    });
  });

  describe('支付回调重定向处理', () => {
    test('应该成功处理支付成功回调', async () => {
      const url = 'http://localhost:3000/api/pay/callback/creem?order_no=order_test_123456&customer_id=customer_test_456&locale=en';
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(307); // 重定向状态码
      expect(mockHandleOrderPaid).toHaveBeenCalledWith(
        'order_test_123456',
        expect.objectContaining({
          source: 'creem-callback',
          customer: expect.objectContaining({
            id: 'customer_test_456'
          })
        }),
        ''
      );

      // 验证重定向 URL
      const location = response.headers.get('Location');
      expect(location).toBe('https://test.example.com/pay-success');
    });

    test('应该处理带有中文语言的回调', async () => {
      const url = 'http://localhost:3000/api/pay/callback/creem?order_no=order_test_123456&customer_id=customer_test_456&locale=zh';
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(307);
      
      const location = response.headers.get('Location');
      expect(location).toBe('https://test.example.com/zh/pay-success');
    });

    test('应该获取客户信息并处理支付', async () => {
      // 模拟 Creem API 客户信息响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCustomerResponse)
      });

      const url = 'http://localhost:3000/api/pay/callback/creem?order_no=order_test_123456&customer_id=customer_test_456&locale=en';
      const request = new NextRequest(url);

      await callbackHandler(request);

      // 验证 API 调用
      expect(fetch).toHaveBeenCalledWith(
        'https://test-api.creem.io/v1/customers?customer_id=customer_test_456',
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test_creem_api_key'
          }
        }
      );

      // 验证订单处理
      expect(mockHandleOrderPaid).toHaveBeenCalledWith(
        'order_test_123456',
        expect.objectContaining({
          source: 'creem-callback',
          customer: expect.objectContaining({
            id: 'customer_test_456',
            email: 'test@example.com'
          }),
          metadata: expect.objectContaining({
            user_email: 'test@example.com'
          })
        }),
        'test@example.com'
      );
    });

    test('应该处理客户信息获取失败', async () => {
      // 模拟 API 错误响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Customer not found')
      });

      const url = 'http://localhost:3000/api/pay/callback/creem?order_no=order_test_123456&customer_id=invalid_customer&locale=en';
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      // 即使客户信息获取失败，也应该继续处理订单
      expect(response.status).toBe(307);
      expect(mockHandleOrderPaid).toHaveBeenCalledWith(
        'order_test_123456',
        expect.objectContaining({
          customer: expect.objectContaining({
            id: 'invalid_customer',
            email: ''
          })
        }),
        ''
      );
    });

    test('应该处理缺少订单号的回调', async () => {
      const url = 'http://localhost:3000/api/pay/callback/creem?customer_id=customer_test_456&locale=en';
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(400);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();

      const result = await response.json();
      expect(result.error).toBe('Missing order_no');
    });

    test('应该处理没有客户 ID 的回调', async () => {
      const url = 'http://localhost:3000/api/pay/callback/creem?order_no=order_test_123456&locale=en';
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(307);
      expect(mockHandleOrderPaid).toHaveBeenCalledWith(
        'order_test_123456',
        expect.objectContaining({
          customer: expect.objectContaining({
            id: '',
            email: ''
          })
        }),
        ''
      );
    });

    test('应该处理订单处理失败的回调', async () => {
      mockHandleOrderPaid.mockRejectedValueOnce(new Error('Order processing failed'));

      const url = 'http://localhost:3000/api/pay/callback/creem?order_no=order_test_123456&locale=en';
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(307);
      
      // 应该重定向到失败页面
      const location = response.headers.get('Location');
      expect(location).toContain('/pay-failed');
    });

    test('应该处理网络错误', async () => {
      // 模拟网络错误
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const url = 'http://localhost:3000/api/pay/callback/creem?order_no=order_test_123456&customer_id=customer_test_456&locale=en';
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      // 网络错误不应该阻止订单处理
      expect(response.status).toBe(307);
      expect(mockHandleOrderPaid).toHaveBeenCalled();
    });
  });

  describe('签名验证安全性', () => {
    test('应该拒绝篡改的请求体', async () => {
      const originalEvent = mockWebhookEvent;
      const tamperedEvent = {
        ...originalEvent,
        object: {
          ...originalEvent.object,
          amount: 9999 // 篡改金额
        }
      };

      const originalBody = JSON.stringify(originalEvent);
      const tamperedBody = JSON.stringify(tamperedEvent);
      
      // 使用原始请求体生成签名
      const validSignature = generateValidSignature(originalBody, process.env.CREEM_WEBHOOK_SECRET!);

      // 但发送篡改的请求体
      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: tamperedBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });

    test('应该使用时间安全的签名比较', async () => {
      const webhookBody = JSON.stringify(mockWebhookEvent);
      const correctSignature = generateValidSignature(webhookBody, process.env.CREEM_WEBHOOK_SECRET!);
      
      // 创建一个接近但不完全正确的签名（时间攻击测试）
      const almostCorrectSignature = correctSignature.slice(0, -1) + '0';

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': almostCorrectSignature
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });

    test('应该验证签名长度', async () => {
      const webhookBody = JSON.stringify(mockWebhookEvent);
      const shortSignature = 'too_short';

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': shortSignature
        },
        body: webhookBody
      });

      const response = await notifyHandler(request);

      expect(response.status).toBe(500);
      expect(mockHandleOrderPaid).not.toHaveBeenCalled();
    });
  });

  describe('幂等性测试', () => {
    test('应该处理重复的 Webhook 通知', async () => {
      const webhookBody = JSON.stringify(mockWebhookEvent);
      const validSignature = generateValidSignature(webhookBody, process.env.CREEM_WEBHOOK_SECRET!);

      const request1 = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: webhookBody
      });

      const request2 = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: webhookBody
      });

      // 第一次调用成功
      const response1 = await notifyHandler(request1);
      expect(response1.status).toBe(200);

      // 第二次调用（重复）也应该成功，但业务层会处理幂等性
      const response2 = await notifyHandler(request2);
      expect(response2.status).toBe(200);

      // 验证两次都调用了订单处理
      expect(mockHandleOrderPaid).toHaveBeenCalledTimes(2);
    });
  });

  describe('错误日志和调试', () => {
    test('应该记录 Webhook 事件详情', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const webhookBody = JSON.stringify(mockWebhookEvent);
      const validSignature = generateValidSignature(webhookBody, process.env.CREEM_WEBHOOK_SECRET!);

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': validSignature
        },
        body: webhookBody
      });

      await notifyHandler(request);

      expect(consoleSpy).toHaveBeenCalledWith('Creem webhook event:', mockWebhookEvent);

      consoleSpy.mockRestore();
    });

    test('应该记录错误详情', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const webhookBody = JSON.stringify(mockWebhookEvent);
      const invalidSignature = 'invalid_signature';

      const request = new Request('http://localhost:3000/api/pay/notify/creem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': invalidSignature
        },
        body: webhookBody
      });

      await notifyHandler(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Creem webhook failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});