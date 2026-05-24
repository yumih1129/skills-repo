'use client'

import { ArrowRight, Tag, Calendar } from 'lucide-react'
import type { Skill } from '@/data/skills'
import { statusConfig } from '@/data/skills'
import { cn } from '@/lib/utils'
import { formatPublishedDate } from '@/lib/date'
import { SkillIcon } from './skill-icon'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SkillCardProps {
  skill: Skill
  onClick: () => void
  isSelected?: boolean
}

export function SkillCard({ skill, onClick, isSelected }: SkillCardProps) {
  const status = statusConfig[skill.status || 'active']

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full rounded-xl text-left transition-shadow duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'ring-3 ring-primary/20'
      )}
    >
      <Card className={cn(
        'h-full p-0! gap-3',
        'transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none',
        'group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:border-primary/25',
        isSelected && 'border-primary/50'
      )}>
        {/* Zone 1: Top - Icon + Status */}
        <div className="flex items-center justify-between p-3 pb-0">
          <SkillIcon
            icon={skill.icon}
            iconType={skill.iconType as 'emoji' | 'library' | 'svg' | undefined}
            iconLibrary={skill.iconLibrary}
            size="sm"
          />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: status.dotBg }} />
            {status.label}
          </span>
        </div>

        {/* Zone 2: Title + Description */}
        <div className="px-3">
          <h3 className="font-semibold leading-tight text-foreground truncate mb-2 text-base">
            {skill.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {skill.description}
          </p>
        </div>

        {/* Zone 3: Tags + Published Date */}
        <div className="flex items-center justify-between gap-2 px-3">
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs gap-1">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
            {skill.tags.length > 3 && (
              <Badge variant="outline" className="text-xs gap-1">
                <Tag className="h-2.5 w-2.5" />
                +{skill.tags.length - 3}
              </Badge>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            {formatPublishedDate(skill.publishedAt)}
          </span>
        </div>

        {/* Zone 4: Bottom - Category + Arrow */}
        <div className={cn(
          'flex items-center justify-between px-3 py-3 border-t transition-colors duration-200 ease-out',
          isSelected ? 'border-primary/30' : 'border-border/40'
        )}>
          <span className="text-xs text-muted-foreground truncate">
            {skill.category || '未分类'}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </div>
      </Card>
    </button>
  )
}
