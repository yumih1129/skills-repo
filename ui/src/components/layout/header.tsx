'use client'

import { Github, Search, X } from 'lucide-react'
import { ThemeSwitch } from './theme-switch'
import { siteConfig } from '@/config/site'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center h-8 gap-2 font-semibold">
          <span className="flex items-center text-xl">{siteConfig.logo}</span>
          <span className="flex items-center">{siteConfig.name}</span>
          <span className="hidden sm:flex items-center text-muted-foreground text-sm ml-1">{siteConfig.description}</span>
        </div>

        <div className="flex items-center gap-3 h-8">
          <div className="hidden sm:block">
            <InputGroup className="w-40 lg:w-64">
              <InputGroupAddon side="left">
                <Search className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <Input
                type="text"
                placeholder={siteConfig.ui.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 pr-8 focus-visible:ring-2"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </InputGroup>
          </div>

          <ThemeSwitch />

          <a
            href={siteConfig.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}

