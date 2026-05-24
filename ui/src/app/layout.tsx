import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { siteConfig } from '@/config/site'

const faviconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="44">✦</text>
  </svg>
`

export const metadata: Metadata = {
  title: 'SKILLS',
  description: 'Skill Library',
  icons: {
    icon: `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inline script to set theme class BEFORE React hydration
  // This prevents hydration mismatch by ensuring the theme class is already set
  const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        var preference = theme === 'light' || theme === 'dark' || theme === 'system'
          ? theme
          : ${JSON.stringify(siteConfig.ui.defaultTheme)};
        document.documentElement.setAttribute('data-theme-preference', preference);
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
          document.documentElement.classList.add(theme);
        } else {
          document.documentElement.classList.add(${JSON.stringify(siteConfig.ui.defaultTheme)});
        }
      } catch (e) {
        document.documentElement.setAttribute('data-theme-preference', ${JSON.stringify(siteConfig.ui.defaultTheme)});
        document.documentElement.classList.add(${JSON.stringify(siteConfig.ui.defaultTheme)});
      }
    })();
  `

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
