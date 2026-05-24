'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { siteConfig } from '@/config/site'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={siteConfig.ui.defaultTheme} enableSystem>
      {children}
    </NextThemesProvider>
  )
}
