'use client'

import { ArrowRight, Tag, Calendar, Clock3 } from 'lucide-react'
import type { Skill } from '@/data/skills'
import { statusConfig } from '@/data/skills'
import { cn } from '@/lib/utils'
import { formatSkillDate, type SkillDateField } from '@/lib/date'
import { SkillIcon } from './skill-icon'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SkillCardProps {
  skill: Skill
  onClick: () => void
  isSelected?: boolean
  dateField?: SkillDateField
}

export function SkillCard({ skill, onClick, isSelected, dateField = 'publishedAt' }: SkillCardProps) {
  const status = statusConfig[skill.status || 'active']
  const isUpdatedMode = dateField === 'updatedAt'
  const dateValue = isUpdatedMode ? (skill.updatedAt ?? skill.publishedAt) : skill.publishedAt

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full rounded-xl text-left transition-shadow duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'ring-3 ring-primary/20'
      )}
    >
      <Card className={cn(
        'h-full p-0! gap-4',
        'transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none',
        'group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:border-primary/25',
        isSelected && 'border-primary/50'
      )}>
        {/* Zone 1: Icon + metadata header */}
        <div className="flex gap-3 p-3 pb-0">
          <SkillIcon
            icon={skill.icon}
            iconType={skill.iconType as 'emoji' | 'library' | 'svg' | undefined}
            iconLibrary={skill.iconLibrary}
            size="xl"
          />
          <div className="flex h-12 min-w-0 flex-1 flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              <h3 className="min-w-0 truncate text-base font-semibold leading-tight text-foreground">
                {skill.name}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-1.5 px-0 py-0.5 rounded text-xs font-medium leading-none text-muted-foreground">
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.dotBg, flexShrink: 0 }} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="min-w-0 truncate text-muted-foreground">
                {skill.category || '未分类'}
              </span>
              <span className="shrink-0 text-muted-foreground/85">
                v{skill.version}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Description */}
        <div className="px-3">
          <p className="text-sm leading-6 text-muted-foreground line-clamp-2">
            {skill.description}
          </p>
        </div>

        {/* Zone 3: Tags + Date */}
        <div className="flex items-center justify-between gap-2 px-3">
          <div className="flex flex-wrap gap-2">
            {skill.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="h-5 gap-1 px-2 text-xs font-medium">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
            {skill.tags.length > 3 && (
              <Badge variant="outline" className="h-5 gap-1 px-2 text-xs font-medium">
                <Tag className="h-2.5 w-2.5" />
                +{skill.tags.length - 3}
              </Badge>
            )}
          </div>
          <span className="inline-flex min-w-23 items-center justify-end gap-1 text-xs text-muted-foreground whitespace-nowrap">
            {isUpdatedMode ? <Clock3 className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            {formatSkillDate(dateValue)}
          </span>
        </div>

        {/* Zone 4: Bottom - Author + Arrow */}
        <div className={cn(
          'flex items-center justify-between px-3 py-2.5 border-t transition-colors duration-200 ease-out',
          isSelected ? 'border-primary/30' : 'border-border/40'
        )}>
          <span className="text-[13px] text-muted-foreground truncate">
            {skill.ownerId}
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground/85">
            更多
            <ArrowRight className="h-3.25 w-3.25 text-muted-foreground/75 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </button>
  )
}
