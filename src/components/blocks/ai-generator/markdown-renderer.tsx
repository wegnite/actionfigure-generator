/**
 * Markdown 渲染器组件
 * 
 * 功能：渲染 AI 生成的 Markdown 格式内容
 * 特性：支持 GFM、代码高亮、表格、列表等
 * 
 * 问题：AI 返回的内容格式多样，需要统一渲染
 * 解决：使用 react-markdown + 插件提供完整的 Markdown 支持
 */

"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 导入高亮样式
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * 代码块组件
 * 
 * 功能：渲染代码块并提供复制功能
 */
function CodeBlock({ 
  inline, 
  className, 
  children, 
  ...props 
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      {language && (
        <div className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground rounded-t-lg border-b border-border">
          {language}
        </div>
      )}
      <pre className={cn(
        "overflow-x-auto p-4 bg-muted/30 rounded-b-lg",
        !language && "rounded-lg",
        className
      )}>
        <code className="text-sm font-mono" {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/**
 * Markdown 渲染器主组件
 */
export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content prose prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 自定义代码块渲染
          code: CodeBlock,
          
          // 自定义标题样式
          h1: ({ children, ...props }: any) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }: any) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground" {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }: any) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground" {...props}>{children}</h3>
          ),
          
          // 自定义段落样式
          p: ({ children, ...props }: any) => (
            <p className="my-4 leading-7 text-foreground/90" {...props}>{children}</p>
          ),
          
          // 自定义列表样式
          ul: ({ children, ...props }: any) => (
            <ul className="my-4 ml-6 list-disc space-y-2" {...props}>{children}</ul>
          ),
          ol: ({ children, ...props }: any) => (
            <ol className="my-4 ml-6 list-decimal space-y-2" {...props}>{children}</ol>
          ),
          li: ({ children, ...props }: any) => (
            <li className="text-foreground/90" {...props}>{children}</li>
          ),
          
          // 自定义表格样式
          table: ({ children, ...props }: any) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }: any) => (
            <thead className="border-b border-border bg-muted/30" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }: any) => (
            <tbody className="divide-y divide-border" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }: any) => (
            <tr className="hover:bg-muted/20 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }: any) => (
            <th className="px-4 py-2 text-left font-semibold text-foreground" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }: any) => (
            <td className="px-4 py-2 text-foreground/90" {...props}>
              {children}
            </td>
          ),
          
          // 自定义链接样式
          a: ({ href, children, ...props }: any) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
          
          // 自定义引用块样式
          blockquote: ({ children, ...props }: any) => (
            <blockquote className="my-4 pl-4 border-l-4 border-primary/50 italic text-muted-foreground" {...props}>
              {children}
            </blockquote>
          ),
          
          // 自定义分隔线样式
          hr: ({ ...props }: any) => (
            <hr className="my-8 border-t border-border" {...props} />
          ),
          
          // 自定义强调样式
          strong: ({ children, ...props }: any) => (
            <strong className="font-bold text-foreground" {...props}>{children}</strong>
          ),
          em: ({ children, ...props }: any) => (
            <em className="italic" {...props}>{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}