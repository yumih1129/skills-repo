'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

const themes = [
  { value: 'light', label: '明亮', icon: Sun },
  { value: 'dark', label: '暗黑', icon: Moon },
  { value: 'system', label: '自动', icon: Monitor },
] as const

function syncThemePreference(theme: (typeof themes)[number]['value']) {
  if (typeof document === 'undefined') return

  document.documentElement.setAttribute('data-theme-preference', theme)
}

export function ThemeSwitch() {
  const { setTheme } = useTheme()

  return (
    <div className="theme-switch flex items-center gap-1 bg-muted rounded-lg p-[3px]">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          data-theme-option={value}
          aria-label={`切换到${label}主题`}
          onClick={() => {
            syncThemePreference(value)
            setTheme(value)
          }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors',
            'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-3 w-3" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
