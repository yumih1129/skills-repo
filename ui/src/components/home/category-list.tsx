'use client'

import type { Skill } from '@/data/skills'
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
      <div className="">
        <h3 className="text-sm font-medium">技能分类</h3>
        <p className="text-xs text-muted-foreground mt-0.5">从仓库元数据自动生成</p>
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
