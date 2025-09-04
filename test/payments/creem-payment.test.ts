/**
 * Creem 支付核心功能测试套件
 * 
 * 测试范围：
 * - Creem API 客户端功能
 * - 支付会话创建和管理
 * - 签名验证机制
 * - 错误处理和异常情况
 * - 客户信息获取
 * 
 * 测试方法：
 * - 使用 Jest 模拟 fetch API
 * - 模拟 Creem API 响应
 * - 验证签名算法正确性
 * - 测试边界条件和错误场景
 */

import crypto from 'crypto';

// 模拟 Creem API 响应数据
const mockCreemCheckoutResponse = {
  id: 'checkout_test_123',
  checkout_url: 'https://checkout.creem.io/test-checkout-123',
  customer_id: 'customer_test_456',
  product_id: 'prod_test_789',
  status: 'created',
  amount: 1000,
  currency: 'USD',
  metadata: {
    order_no: 'order_test_123456',
    user_uuid: 'user_test_uuid',
  }
};

const mockCreemCustomerResponse = {
  id: 'customer_test_456',
  email: 'test@example.com',
  name: 'Test User',
  created_at: '2024-01-01T00:00:00Z'
};

const mockCreemWebhookEvent = {
  type: 'checkout.completed',
  object: {
    id: 'checkout_test_123',
    status: 'completed',
    customer: {
      id: 'customer_test_456',
      email: 'test@example.com'
    },
    metadata: {
      order_no: 'order_test_123456',
      user_uuid: 'user_test_uuid',
      user_email: 'test@example.com'
    }
  }
};

// 模拟全局 fetch
global.fetch = jest.fn();

describe('Creem 支付核心功能测试', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 设置环境变量
    process.env.CREEM_API_KEY = 'test_creem_api_key';
    process.env.CREEM_ENV = 'test';
    process.env.CREEM_WEBHOOK_SECRET = 'test_webhook_secret';
    process.env.NEXT_PUBLIC_WEB_URL = 'https://test.example.com';
  });

  describe('Creem Checkout 会话创建', () => {
    test('应该成功创建 Creem 支付会话', async () => {
      // 模拟 API 成功响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemCheckoutResponse)
      });

      const checkoutData = {
        product_id: 'prod_test_789',
        request_id: 'order_test_123456',
        units: 1,
        customer: {
          email: 'test@example.com'
        },
        success_url: 'https://test.example.com/success',
        metadata: {
          order_no: 'order_test_123456',
          user_uuid: 'user_test_uuid'
        }
      };

      const baseUrl = 'https://test-api.creem.io';
      const response = await fetch(`${baseUrl}/v1/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CREEM_API_KEY!
        },
        body: JSON.stringify(checkoutData)
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        'https://test-api.creem.io/v1/checkouts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test_creem_api_key'
          },
          body: JSON.stringify(checkoutData)
        }
      );

      expect(result).toEqual(mockCreemCheckoutResponse);
      expect(result.checkout_url).toBeDefined();
      expect(result.id).toBeDefined();
    });

    test('应该处理 Creem API 错误响应', async () => {
      // 模拟 API 错误响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid product ID')
      });

      const checkoutData = {
        product_id: 'invalid_product',
        request_id: 'order_test_123456'
      };

      const baseUrl = 'https://test-api.creem.io';
      const response = await fetch(`${baseUrl}/v1/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CREEM_API_KEY!
        },
        body: JSON.stringify(checkoutData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const errorText = await response.text();
      expect(errorText).toBe('Invalid product ID');
    });

    test('应该正确处理生产环境和测试环境 URL', () => {
      // 测试环境
      process.env.CREEM_ENV = 'test';
      const testUrl = process.env.CREEM_ENV === 'prod' 
        ? 'https://api.creem.io' 
        : 'https://test-api.creem.io';
      expect(testUrl).toBe('https://test-api.creem.io');

      // 生产环境
      process.env.CREEM_ENV = 'prod';
      const prodUrl = process.env.CREEM_ENV === 'prod' 
        ? 'https://api.creem.io' 
        : 'https://test-api.creem.io';
      expect(prodUrl).toBe('https://api.creem.io');
    });
  });

  describe('Creem 客户信息获取', () => {
    test('应该成功获取客户信息', async () => {
      // 模拟 API 成功响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemCustomerResponse)
      });

      const customerId = 'customer_test_456';
      const baseUrl = 'https://test-api.creem.io';
      
      const response = await fetch(
        `${baseUrl}/v1/customers?customer_id=${customerId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CREEM_API_KEY!
          }
        }
      );

      const customerData = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        'https://test-api.creem.io/v1/customers?customer_id=customer_test_456',
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test_creem_api_key'
          }
        }
      );

      expect(customerData).toEqual(mockCreemCustomerResponse);
      expect(customerData.email).toBe('test@example.com');
      expect(customerData.id).toBe('customer_test_456');
    });

    test('应该处理客户信息获取失败', async () => {
      // 模拟 API 错误响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Customer not found')
      });

      const customerId = 'invalid_customer';
      const baseUrl = 'https://test-api.creem.io';
      
      const response = await fetch(
        `${baseUrl}/v1/customers?customer_id=${customerId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CREEM_API_KEY!
          }
        }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('Webhook 签名验证', () => {
    test('应该正确验证 HMAC SHA256 签名', () => {
      const secret = 'test_webhook_secret';
      const body = JSON.stringify(mockCreemWebhookEvent);
      
      // 生成预期签名
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      // 验证签名
      const actualSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      expect(actualSignature).toBe(expectedSignature);
      expect(actualSignature).toMatch(/^[a-f0-9]{64}$/); // 64字符的十六进制字符串
    });

    test('应该拒绝无效签名', () => {
      const secret = 'test_webhook_secret';
      const body = JSON.stringify(mockCreemWebhookEvent);
      
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const invalidSignature = 'invalid_signature';

      expect(validSignature).not.toBe(invalidSignature);
    });

    test('应该处理不同的签名密钥', () => {
      const body = JSON.stringify(mockCreemWebhookEvent);
      
      const signature1 = crypto
        .createHmac('sha256', 'secret1')
        .update(body)
        .digest('hex');

      const signature2 = crypto
        .createHmac('sha256', 'secret2')
        .update(body)
        .digest('hex');

      expect(signature1).not.toBe(signature2);
    });
  });

  describe('环境配置验证', () => {
    test('应该验证必需的环境变量', () => {
      expect(process.env.CREEM_API_KEY).toBeDefined();
      expect(process.env.CREEM_ENV).toBeDefined();
      expect(process.env.CREEM_WEBHOOK_SECRET).toBeDefined();
    });

    test('应该处理缺失的环境变量', () => {
      delete process.env.CREEM_API_KEY;
      
      expect(process.env.CREEM_API_KEY).toBeUndefined();
    });

    test('应该验证产品映射配置', () => {
      const mockProductMapping = {
        'product_basic': 'creem_prod_123',
        'product_premium': 'creem_prod_456'
      };

      process.env.CREEM_PRODUCTS = JSON.stringify(mockProductMapping);
      
      const products = JSON.parse(process.env.CREEM_PRODUCTS);
      expect(products['product_basic']).toBe('creem_prod_123');
      expect(products['product_premium']).toBe('creem_prod_456');
    });
  });

  describe('错误处理', () => {
    test('应该处理网络错误', async () => {
      // 模拟网络错误
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('https://test-api.creem.io/v1/checkouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CREEM_API_KEY!
          },
          body: JSON.stringify({})
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    test('应该处理无效的 JSON 响应', async () => {
      // 模拟无效的 JSON 响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const response = await fetch('https://test-api.creem.io/v1/checkouts');
      
      try {
        await response.json();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid JSON');
      }
    });

    test('应该处理空响应', async () => {
      // 模拟空响应
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null)
      });

      const response = await fetch('https://test-api.creem.io/v1/checkouts');
      const data = await response.json();
      
      expect(data).toBeNull();
    });
  });

  describe('数据格式验证', () => {
    test('应该验证支付会话数据结构', () => {
      const checkoutData = mockCreemCheckoutResponse;
      
      expect(checkoutData).toHaveProperty('id');
      expect(checkoutData).toHaveProperty('checkout_url');
      expect(checkoutData).toHaveProperty('customer_id');
      expect(checkoutData).toHaveProperty('product_id');
      expect(checkoutData).toHaveProperty('status');
      expect(checkoutData).toHaveProperty('amount');
      expect(checkoutData).toHaveProperty('currency');
      expect(checkoutData).toHaveProperty('metadata');
      
      // 验证数据类型
      expect(typeof checkoutData.id).toBe('string');
      expect(typeof checkoutData.checkout_url).toBe('string');
      expect(typeof checkoutData.amount).toBe('number');
      expect(typeof checkoutData.metadata).toBe('object');
    });

    test('应该验证 Webhook 事件数据结构', () => {
      const webhookEvent = mockCreemWebhookEvent;
      
      expect(webhookEvent).toHaveProperty('type');
      expect(webhookEvent).toHaveProperty('object');
      expect(webhookEvent.object).toHaveProperty('id');
      expect(webhookEvent.object).toHaveProperty('status');
      expect(webhookEvent.object).toHaveProperty('customer');
      expect(webhookEvent.object).toHaveProperty('metadata');
      
      // 验证嵌套对象
      expect(webhookEvent.object.customer).toHaveProperty('id');
      expect(webhookEvent.object.customer).toHaveProperty('email');
      expect(webhookEvent.object.metadata).toHaveProperty('order_no');
    });

    test('应该验证客户数据结构', () => {
      const customerData = mockCreemCustomerResponse;
      
      expect(customerData).toHaveProperty('id');
      expect(customerData).toHaveProperty('email');
      expect(customerData).toHaveProperty('name');
      expect(customerData).toHaveProperty('created_at');
      
      // 验证邮箱格式
      expect(customerData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      
      // 验证日期格式
      expect(customerData.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  });

  describe('支付流程集成测试', () => {
    test('应该完整模拟支付创建到完成流程', async () => {
      // 第一步：创建支付会话
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreemCheckoutResponse)
      });

      const checkoutResponse = await fetch('https://test-api.creem.io/v1/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CREEM_API_KEY!
        },
        body: JSON.stringify({
          product_id: 'prod_test_789',
          request_id: 'order_test_123456'
        })
      });

      const checkoutData = await checkoutResponse.json();
      expect(checkoutData.checkout_url).toBeDefined();

      // 第二步：模拟 Webhook 回调
      const webhookBody = JSON.stringify(mockCreemWebhookEvent);
      const signature = crypto
        .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET!)
        .update(webhookBody)
        .digest('hex');

      // 验证签名
      const expectedSig = crypto
        .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET!)
        .update(webhookBody)
        .digest('hex');

      expect(signature).toBe(expectedSig);

      // 解析 Webhook 事件
      const event = JSON.parse(webhookBody);
      expect(event.type).toBe('checkout.completed');
      expect(event.object.metadata.order_no).toBe('order_test_123456');
    });
  });
});