'use client'

import dynamic from 'next/dynamic'
import { ExternalLink, Calendar, Tag, FileText, ClipboardList, Loader2 } from 'lucide-react'
import type { Skill } from '@/data/skills'
import { statusConfig } from '@/data/skills'
import { cn } from '@/lib/utils'
import { SkillIcon } from './skill-icon'
import { getResourceUrl } from '@/lib/resource-url'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const MarkdownRenderer = dynamic(
  () => import('@/components/markdown/markdown-renderer').then((mod) => mod.MarkdownRenderer),
  { loading: () => <div className="flex items-center justify-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /><span className="text-sm">加载中...</span></div> }
)

type ResourceType = 'docs' | 'evaluation' | null

interface ResourceContent {
  loading: boolean
  content: string | null
  error: string | null
}

interface SkillDetailProps {
  skill: Skill | null
  onClose: () => void
}

export function SkillDetail({ skill, onClose }: SkillDetailProps) {
  const [selectedResource, setSelectedResource] = useState<ResourceType>(null)
  const [resourceContent, setResourceContent] = useState<ResourceContent>({
    loading: false,
    content: null,
    error: null,
  })

  // Determine available resources and set default
  useEffect(() => {
    if (!skill) return

    if (skill.hasDocs) {
      setSelectedResource('docs')
    } else if (skill.hasEvaluation) {
      setSelectedResource('evaluation')
    } else {
      setSelectedResource(null)
    }

    // Reset content when skill changes
    setResourceContent({ loading: false, content: null, error: null })
  }, [skill?.id])

  // Fetch resource content when selection changes
  useEffect(() => {
    if (!selectedResource || !skill) {
      setResourceContent({ loading: false, content: null, error: null })
      return
    }

    const resourcePath = selectedResource === 'docs' ? skill.docsPath : skill.evaluationPath
    const url = getResourceUrl(resourcePath)

    setResourceContent({ loading: true, content: null, error: null })

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('无法加载内容')
        return res.text()
      })
      .then((text) => {
        setResourceContent({ loading: false, content: text, error: null })
      })
      .catch((err) => {
        setResourceContent({ loading: false, content: null, error: err.message || '加载失败' })
      })
  }, [selectedResource, skill?.id])

  if (!skill) {
    return null
  }

  const status = statusConfig[skill.status || 'active']

  // Determine available resources
  const hasDocs = skill.hasDocs
  const hasEvaluation = skill.hasEvaluation
  const hasAnyResource = hasDocs || hasEvaluation

  // Handle resource card click
  const handleResourceClick = (resource: ResourceType) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (resource) {
      setSelectedResource(resource)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SheetHeader className="px-4 py-4 border-b border-border/60 shrink-0">
        <SheetTitle className="text-[16px]! font-medium leading-snug">详情</SheetTitle>
      </SheetHeader>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Summary: Icon + Right Info Block */}
        <div className="flex items-start gap-4 px-4 pt-4 pb-3">
          {/* Left: Icon */}
          <SkillIcon
            icon={skill.icon}
            iconType={skill.iconType as 'emoji' | 'library' | 'svg' | undefined}
            iconLibrary={skill.iconLibrary}
            size="xl"
          />

          {/* Right: Two rows */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Title + External Link Icon + Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                {skill.homepage ? (
                  <a
                    href={skill.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
                  >
                    <span className="text-card-title-lg">{skill.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                ) : (
                  <span className="text-card-title-lg">{skill.name}</span>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 px-0 py-0.5 rounded text-[14px]! font-medium leading-none text-muted-foreground">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.dotBg, flexShrink: 0 }} />
                {status.label}
              </span>
            </div>

            {/* Row 2: Category + Version */}
            <div className="flex items-center justify-between text-meta-sm">
              <span className="text-muted-foreground">{skill.category || '未分类'}</span>
              <span className="text-muted-foreground">v{skill.version}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pb-4">
          <p className="text-body">{skill.description}</p>
        </div>

        {/* Tags + Published Date */}
        <div className="flex items-center justify-between px-4 pb-4 gap-4">
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs gap-1">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            {skill.publishedAt ? new Date(skill.publishedAt).toLocaleDateString('zh-CN') : 'N/A'}
          </span>
        </div>

        {/* Section 3: Resources */}

        <Separator className="h-px mx-4 mb-4" />

        <div className="px-4">
          <h4 className="text-section-title mb-2.5">资源文档</h4>
          {/* Resource Items */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleResourceClick('docs')}
              disabled={!hasDocs}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
                selectedResource === 'docs' && hasDocs
                  ? 'bg-muted border-transparent text-foreground'
                  : 'border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                !hasDocs && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{hasDocs ? '使用手册' : '使用手册（暂无）'}</span>
            </button>

            <button
              onClick={handleResourceClick('evaluation')}
              disabled={!hasEvaluation}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
                selectedResource === 'evaluation' && hasEvaluation
                  ? 'bg-muted border-transparent text-foreground'
                  : 'border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                !hasEvaluation && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
              )}
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{hasEvaluation ? '评估报告' : '评估报告（暂无）'}</span>
            </button>
          </div>
        </div>

        <Separator className="h-px mx-4 mt-4 shrink-0" />

        <div className="pl-4 flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {/* Resource Content */}
          {hasAnyResource && (
            <div className="mt-4">
              {resourceContent.loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">加载中...</span>
                </div>
              ) : resourceContent.error ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <span className="text-sm">{resourceContent.error}</span>
                </div>
              ) : resourceContent.content ? (
                <MarkdownRenderer content={resourceContent.content} />
              ) : null}
            </div>
          )}

          {!hasAnyResource && (
            <div className="text-center py-4 pr-4 text-muted-foreground text-sm">
              暂无资源文档
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
