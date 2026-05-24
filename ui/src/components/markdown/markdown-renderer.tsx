'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
}

function MarkdownTableShell({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isHorizontallyScrollable, setIsHorizontallyScrollable] = useState(false)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const updateScrollableState = () => {
      setIsHorizontallyScrollable(element.scrollWidth > element.clientWidth + 1)
    }

    updateScrollableState()

    const resizeObserver = new ResizeObserver(() => {
      updateScrollableState()
    })

    resizeObserver.observe(element)

    const table = element.querySelector('table')
    if (table) {
      resizeObserver.observe(table)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      className={cn(
        'markdown-table-shell my-3 max-w-full overflow-x-auto overflow-y-hidden rounded-lg border border-border/60 scrollbar-thin',
        isHorizontallyScrollable && 'markdown-table-shell-scrollable'
      )}
    >
      <table className="markdown-table w-max min-w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none min-w-0 text-muted-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-lg font-semibold text-foreground mb-2 mt-4 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold text-foreground mb-2 mt-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mb-1 mt-3">{children}</h3>,
          p: ({ children }) => <p className="text-sm leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside text-sm mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-sm mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-3 border-border pl-3 italic text-muted-foreground/80 my-3">{children}</blockquote>,
          code: ({ className, children }) => {
            const isInline = !className
            if (isInline) {
              return <code className="inline-flex text-xs bg-secondary px-1 py-0.5 rounded">{children}</code>
            }
            return <code className="block text-xs bg-secondary px-1 py-0.5 rounded overflow-x-auto">{children}</code>
          },
          pre: ({ children }) => <pre className="bg-secondary p-3 rounded-lg overflow-x-auto my-3 text-xs">{children}</pre>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>,
          hr: () => <hr className="border-border my-4" />,
          table: ({ children }) => (
            <MarkdownTableShell>{children}</MarkdownTableShell>
          ),
          th: ({ children }) => (
            <th className="whitespace-nowrap border border-border bg-secondary px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="whitespace-nowrap border border-border px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
