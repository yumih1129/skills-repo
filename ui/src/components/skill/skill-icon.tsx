'use client'

import { cn } from '@/lib/utils'
import { HelpCircle } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

type IconType = 'emoji' | 'library' | 'svg'

interface SkillIconProps {
  icon: string
  iconType?: IconType
  iconLibrary?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Unified container sizes - all three icon types share the same container dimensions
const CONTAINER_SIZES = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-12 h-12',
} as const

// Icon element sizing - unified approach for all types
const ICON_SIZES = {
  sm: 20,
  md: 24,
  lg: 32,
  xl: 28,
} as const

// Container styles shared by all icon types
const containerBaseStyles = 'flex items-center justify-center rounded-xl border bg-secondary/40 flex-shrink-0'

function processSvg(svgContent: string, targetSize: number, colorClass: string): string {
  // Remove all existing width/height attributes
  let processed = svgContent.replace(/\s(width|height)="[^"]*"/g, '')

  // Ensure viewBox exists and set width/height to target
  processed = processed.replace(
    /viewBox="0 0 (\d+) (\d+)"/,
    (_, w, h) => `viewBox="0 0 ${w} ${h}" width="${targetSize}" height="${targetSize}"`
  )

  // Replace currentColor with a CSS variable for theme compatibility
  processed = processed.replace(/currentColor/g, 'currentColor')

  // Add class for color and ensure proper scaling
  processed = processed.replace(/^<svg/, `<svg class="${colorClass}"`)

  return processed
}

export function SkillIcon({ icon, iconType = 'emoji', iconLibrary, size = 'md', className }: SkillIconProps) {
  const containerSize = CONTAINER_SIZES[size]
  const iconPixelSize = ICON_SIZES[size]

  // Fallback icon when icon is missing
  if (!icon) {
    return (
      <div className={cn(containerBaseStyles, containerSize, className)}>
        <HelpCircle width={iconPixelSize} height={iconPixelSize} className="text-muted-foreground" />
      </div>
    )
  }

  // Emoji / direct icon (legacy format or explicit emoji type)
  if (iconType === 'emoji' || (!iconType && !icon.includes('/') && !iconLibrary && !icon.startsWith('<'))) {
    return (
      <div className={cn(containerBaseStyles, containerSize, className)}>
        <span
          style={{
            fontSize: iconPixelSize,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="select-none"
        >
          {icon}
        </span>
      </div>
    )
  }

  // Library icon (e.g., lucide-react)
  if (iconType === 'library' || iconLibrary) {
    const iconName = icon as keyof typeof LucideIcons
    const IconComponent = LucideIcons[iconName] as typeof HelpCircle | undefined

    if (IconComponent) {
      return (
        <div className={cn(containerBaseStyles, containerSize, className)}>
          <IconComponent
            width={iconPixelSize}
            height={iconPixelSize}
            className="text-foreground/80"
          />
        </div>
      )
    }

    // Fallback for missing library icon
    return (
      <div className={cn(containerBaseStyles, containerSize, className)}>
        <HelpCircle width={iconPixelSize} height={iconPixelSize} className="text-muted-foreground" />
      </div>
    )
  }

  // SVG icon - must be complete SVG string
  if (iconType === 'svg' || icon.startsWith('<')) {
    const processedSvg = processSvg(icon, iconPixelSize, 'text-foreground/80')

    return (
      <div
        className={cn(containerBaseStyles, containerSize, className)}
        dangerouslySetInnerHTML={{ __html: processedSvg }}
      />
    )
  }

  // Default fallback
  return (
    <div className={cn(containerBaseStyles, containerSize, className)}>
      <HelpCircle width={iconPixelSize} height={iconPixelSize} className="text-muted-foreground" />
    </div>
  )
}
