'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { House, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - extremely subtle, stays behind */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      >
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[900px] h-[900px] rounded-full',
            'bg-gradient-to-b from-foreground/[0.015] to-transparent',
            'dark:from-foreground/[0.03] dark:to-transparent'
          )}
        />
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[560px] h-[560px] rounded-full',
            'border border-border/15 dark:border-border/25',
            'animate-fade-in [animation-delay:500ms] [animation-fill-mode:backwards]'
          )}
        />
      </div>

      {/* Premium card panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-[340px] mx-auto px-4',
          'animate-fade-in [animation-delay:80ms] [animation-fill-mode:backwards]'
        )}
      >
        {/* Outer ring / shell */}
        <div
          className={cn(
            'rounded-2xl border border-border/60 dark:border-border/50',
            'bg-card/80 dark:bg-card/60',
            'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]',
            'dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.3)]',
            'ring-1 ring-border/40 dark:ring-border/30',
            'overflow-hidden'
          )}
        >
          {/* Inner content area with subtle top highlight */}
          <div className="relative px-6 pt-7 pb-6 sm:px-8 sm:pt-8 sm:pb-7">
            {/* Subtle top edge highlight */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent dark:via-foreground/10"
            />

            {/* Top status badge */}
            <div
              className={cn(
                'flex justify-center mb-5',
                'animate-fade-in [animation-delay:150ms] [animation-fill-mode:backwards]'
              )}
            >
              <Badge
                variant="outline"
                className={cn(
                  'gap-1.5 text-[11px] font-medium px-2.5 py-0.5',
                  'border-border/70 dark:border-border/60',
                  'text-muted-foreground dark:text-muted-foreground/80',
                  'bg-muted/30 dark:bg-muted/20'
                )}
              >
                <AlertCircle className="size-3" />
                Error 404
              </Badge>
            </div>

            {/* 404 - refined typographic treatment */}
            <div
              className={cn(
                'relative flex justify-center mb-1',
                'animate-fade-in [animation-delay:220ms] [animation-fill-mode:backwards]'
              )}
            >
              {/* Subtle bg block behind number */}
              <div
                aria-hidden="true"
                className={cn(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                  'w-[180px] h-[72px] rounded-xl',
                  'bg-muted/50 dark:bg-muted/30',
                  'ring-1 ring-border/50 dark:ring-border/40'
                )}
              />
              <span
                className={cn(
                  'relative text-[72px] sm:text-[80px] leading-none font-bold tracking-[-0.03em]',
                  'text-foreground/75 dark:text-foreground/80',
                  'select-none pointer-events-none'
                )}
              >
                404
              </span>
            </div>

            {/* Title */}
            <h1
              className={cn(
                'text-[17px] font-semibold text-foreground tracking-tight',
                'mt-4 mb-1.5',
                'animate-fade-in [animation-delay:300ms] [animation-fill-mode:backwards]'
              )}
            >
              页面不存在
            </h1>

            {/* Description */}
            <p
              className={cn(
                'text-[13px] text-muted-foreground leading-relaxed',
                'max-w-[240px] mx-auto',
                'animate-fade-in [animation-delay:360ms] [animation-fill-mode:backwards]'
              )}
            >
              你访问的页面可能已被移除，或链接地址有误。
            </p>

            {/* Footer divider */}
            <div
              className={cn(
                'mt-6 mb-5 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent',
                'animate-fade-in [animation-delay:420ms] [animation-fill-mode:backwards]'
              )}
            />

            {/* Action footer */}
            <div
              className={cn(
                'flex flex-col-reverse sm:flex-row items-center justify-between gap-2',
                'animate-fade-in [animation-delay:480ms] [animation-fill-mode:backwards]'
              )}
            >
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1.5 h-8 px-3.5 text-[13px]',
                  'border-border/70 dark:border-border/60',
                  'text-muted-foreground dark:text-muted-foreground/90',
                  'hover:bg-muted/60 hover:text-foreground',
                  'active:scale-[0.98] transition-all duration-150'
                )}
                onClick={handleGoBack}
              >
                <ArrowLeft className="size-3.5" />
                返回前页
              </Button>

              <Link
                href="/"
                className={cn(
                  'inline-flex shrink-0 items-center justify-center gap-1.5',
                  'h-8 px-4 rounded-lg text-[13px] font-medium',
                  'bg-primary text-primary-foreground',
                  'transition-all duration-150',
                  'hover:bg-primary/90 hover:shadow-sm hover:shadow-black/10',
                  'active:scale-[0.98]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60'
                )}
              >
                <House className="size-3.5" />
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
