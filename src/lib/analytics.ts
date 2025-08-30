/**
 * Google Analytics 工具函数
 * 
 * 提供类型安全的 Google Analytics 事件跟踪功能
 * 用于跟踪用户行为、转化和自定义事件
 */

// 自定义事件类型定义
export interface CustomEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// 页面浏览事件参数
export interface PageViewEvent {
  page_title?: string;
  page_location?: string;
  content_group?: string;
  custom_parameters?: Record<string, any>;
}

// 转化事件参数（用于跟踪AI生成等重要操作）
export interface ConversionEvent {
  event_name: 'generate_character' | 'purchase_credits' | 'user_signup' | 'video_generate';
  value?: number;
  currency?: string;
  custom_parameters?: Record<string, any>;
}

/**
 * 发送自定义事件到 Google Analytics
 * @param event 事件参数
 */
export const trackEvent = (event: CustomEvent): void => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Google Analytics 未加载，无法跟踪事件:', event);
    return;
  }

  try {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    });

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 GA事件已跟踪:', event);
    }
  } catch (error) {
    console.error('Google Analytics 事件跟踪失败:', error);
  }
};

/**
 * 跟踪页面浏览
 * @param event 页面浏览参数
 */
export const trackPageView = (event: PageViewEvent): void => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!, {
      page_title: event.page_title,
      page_location: event.page_location || window.location.href,
      content_group: event.content_group,
      ...event.custom_parameters,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('📄 GA页面浏览已跟踪:', event);
    }
  } catch (error) {
    console.error('Google Analytics 页面跟踪失败:', error);
  }
};

/**
 * 跟踪转化事件（重要业务指标）
 * @param event 转化事件参数
 */
export const trackConversion = (event: ConversionEvent): void => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', event.event_name, {
      event_category: 'conversion',
      value: event.value,
      currency: event.currency || 'USD',
      ...event.custom_parameters,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('💰 GA转化事件已跟踪:', event);
    }
  } catch (error) {
    console.error('Google Analytics 转化跟踪失败:', error);
  }
};

/**
 * 跟踪AI生成操作（核心业务指标）
 */
export const trackAIGeneration = (type: 'character' | 'video' | 'image', model?: string): void => {
  trackConversion({
    event_name: type === 'character' ? 'generate_character' : 'video_generate',
    custom_parameters: {
      ai_model: model,
      generation_type: type,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * 跟踪用户注册
 */
export const trackUserSignup = (method?: string): void => {
  trackConversion({
    event_name: 'user_signup',
    custom_parameters: {
      signup_method: method,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * 跟踪付费转化
 */
export const trackPurchase = (value: number, currency: string = 'USD', plan_name?: string): void => {
  trackConversion({
    event_name: 'purchase_credits',
    value,
    currency,
    custom_parameters: {
      plan_name,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * 跟踪用户互动（按钮点击、功能使用等）
 */
export const trackInteraction = (element: string, action: string, label?: string): void => {
  trackEvent({
    action,
    category: 'user_interaction',
    label: `${element}${label ? `:${label}` : ''}`,
  });
};

/**
 * 跟踪错误事件
 */
export const trackError = (error_message: string, error_category: string = 'javascript_error'): void => {
  trackEvent({
    action: 'error',
    category: error_category,
    label: error_message,
  });
};

/**
 * 设置用户属性
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!, {
      custom_map: properties,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('👤 GA用户属性已设置:', properties);
    }
  } catch (error) {
    console.error('Google Analytics 用户属性设置失败:', error);
  }
};

// 预定义的常用事件跟踪函数
export const analytics = {
  // 页面事件
  pageView: trackPageView,
  
  // 转化事件
  aiGeneration: trackAIGeneration,
  userSignup: trackUserSignup,
  purchase: trackPurchase,
  
  // 用户交互
  interaction: trackInteraction,
  buttonClick: (button_name: string, location?: string) => 
    trackInteraction('button', 'click', `${button_name}${location ? `_${location}` : ''}`),
  
  // 错误跟踪
  error: trackError,
  
  // 用户属性
  setUser: setUserProperties,
  
  // 自定义事件
  custom: trackEvent,
};

export default analytics;