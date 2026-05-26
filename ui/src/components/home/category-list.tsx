'use client'

import type { Skill } from '@/data/skills'
import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CategoryListProps {
  categories: string[]
  skills: Skill[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryList({ categories, skills, selectedCategory, onCategoryChange }: CategoryListProps) {
  const getCategoryCount = (category: string) => {
    if (category === '全部') return skills.length
    return skills.filter(s => s.category === category).length
  }

  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-medium leading-7.5">技能分类</h3>
        <div className="group relative inline-flex items-center">
          <button
            type="button"
            aria-label="查看分类说明"
            className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CircleHelp className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            从仓库元数据自动生成
          </div>
        </div>
      </div>
      {categories.map((category) => {
        const isSelected = selectedCategory === category
        return (
          <div key={category} className="relative">
            <Button
              variant="ghost"
              aria-pressed={isSelected}
              className={cn(
                'w-full justify-between px-3 py-2 h-auto text-sm',
                isSelected
                  ? 'bg-muted text-foreground hover:bg-muted'
                  : 'bg-transparent text-foreground hover:bg-muted'
              )}
              onClick={() => onCategoryChange(category)}
            >
              <span className="flex-1 text-left">{category}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {getCategoryCount(category)}
              </Badge>
            </Button>
          </div>
        )
      })}
    </div>
  )
}
