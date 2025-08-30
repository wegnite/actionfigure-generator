// 示例测试文件 - 验证测试环境配置
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'

// 简单组件用于测试
function TestComponent({ message }: { message: string }) {
  return (
    <div data-testid="test-component">
      <h1>测试组件</h1>
      <p>{message}</p>
    </div>
  )
}

describe('测试环境验证', () => {
  it('应该正确渲染React组件', () => {
    const message = '测试消息'
    render(<TestComponent message={message} />)
    
    // 验证组件正确渲染
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('测试组件')).toBeInTheDocument()
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('应该支持DOM查询和匹配器', () => {
    render(<TestComponent message="Jest DOM 匹配器测试" />)
    
    // 验证 jest-dom 匹配器工作正常
    const heading = screen.getByText('测试组件')
    expect(heading).toBeVisible()
    expect(heading.tagName).toBe('H1')
  })

  it('应该支持快照测试', () => {
    const { container } = render(<TestComponent message="快照测试" />)
    
    // 快照测试确保组件输出一致性
    expect(container.firstChild).toMatchSnapshot()
  })
})

describe('测试工具集成验证', () => {
  it('应该支持异步测试', async () => {
    // 模拟异步操作
    const asyncFunction = async () => {
      return new Promise(resolve => setTimeout(() => resolve('异步完成'), 10))
    }

    const result = await asyncFunction()
    expect(result).toBe('异步完成')
  })

  it('应该支持模拟函数', () => {
    const mockFunction = jest.fn()
    mockFunction('测试参数')
    
    expect(mockFunction).toHaveBeenCalledWith('测试参数')
    expect(mockFunction).toHaveBeenCalledTimes(1)
  })
})