'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Calendar, Clock3, ArrowUpDown } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { CategoryList } from '@/components/home/category-list'
import { MobileSearch } from '@/components/home/mobile-search'
import { SkillCard } from '@/components/skill/skill-card'
import { SkillDetail } from '@/components/skill/skill-detail'
import { Footer } from '@/components/layout/footer'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { Skill } from '@/data/skills'
import type { SkillDateField } from '@/lib/date'

type SortOrder = 'publishedAt' | 'updatedAt' | 'name'

interface HomeClientProps {
  skills: Skill[]
  categories: string[]
}

export function HomeClient({ skills, categories }: HomeClientProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('publishedAt')
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close drawer on route change
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsDrawerOpen(false)
      setSelectedSkill(null)
    }
  }, [pathname])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  const filteredSkills = useMemo(() => {
    const filtered = skills.filter((skill) => {
      const matchesSearch =
        searchQuery === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === '全部' || skill.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Sort by selected order
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'publishedAt') {
        // Published time: newest first (descending)
        const timeA = a.publishedAt ?? 0
        const timeB = b.publishedAt ?? 0
        return timeB - timeA
      } else if (sortOrder === 'updatedAt') {
        // Updated time: newest first (descending)
        const timeA = a.updatedAt ?? a.publishedAt ?? 0
        const timeB = b.updatedAt ?? b.publishedAt ?? 0
        return timeB - timeA
      } else {
        // Name: alphabetical ascending
        const nameA = a.name || a.slug || ''
        const nameB = b.name || b.slug || ''
        return nameA.localeCompare(nameB)
      }
    })

    return sorted
  }, [searchQuery, selectedCategory, skills, sortOrder])

  const selectedSkillData = selectedSkill
    ? skills.find((s) => s.id === selectedSkill) || null
    : null

  const handleSkillClick = (skillId: string) => {
    const isOpening = skillId !== selectedSkill
    setSelectedSkill(skillId)
    if (isOpening) {
      setIsDrawerOpen(true)
    }
  }

  const handleCloseDetail = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsDrawerOpen(false)
    closeTimeoutRef.current = setTimeout(() => {
      setSelectedSkill(null)
      closeTimeoutRef.current = null
    }, 300)
  }

  const dateField: SkillDateField = sortOrder === 'updatedAt' ? 'updatedAt' : 'publishedAt'

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:py-4">
          {/* Left Sidebar - Category List */}
          <aside className="lg:w-48 lg:shrink-0">
            <div className="lg:sticky lg:top-20">
              <CategoryList
                categories={categories}
                skills={skills}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </aside>

          {/* Main Content - Skill Cards */}
          <div className="flex-1 min-w-0">
            <MobileSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="mb-4 flex items-center justify-between">
              <span className="text-base leading-[30px] text-muted-foreground">
                {filteredSkills.length} 个技能
              </span>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.75">
                <button
                  onClick={() => setSortOrder('publishedAt')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors',
                    sortOrder === 'publishedAt'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  发布时间
                </button>
                <button
                  onClick={() => setSortOrder('updatedAt')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors',
                    sortOrder === 'updatedAt'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Clock3 className="h-3 w-3" />
                  更新时间
                </button>
                <button
                  onClick={() => setSortOrder('name')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors',
                    sortOrder === 'name'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  技能名称
                </button>
              </div>
            </div>

            {filteredSkills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-1">没有找到匹配的技能</p>
                <p className="text-sm">尝试调整搜索条件或分类筛选</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <SkillCard
                      skill={skill}
                      onClick={() => handleSkillClick(skill.id)}
                      isSelected={selectedSkill === skill.id}
                      dateField={dateField}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Sheet */}
      <Sheet open={isDrawerOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDetail()
        }
      }}>
        <SheetContent side="right" className="w-full sm:w-160! sm:max-w-160! p-0">
          <SkillDetail
            skill={selectedSkillData}
            onClose={handleCloseDetail}
            dateField={dateField}
          />
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  )
}
