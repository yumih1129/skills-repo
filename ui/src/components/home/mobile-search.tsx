'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface MobileSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function MobileSearch({ searchQuery, onSearchChange }: MobileSearchProps) {
  return (
    <div className="sm:hidden relative mb-4 sm:mb-0">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
      <Input
        type="text"
        placeholder="搜索..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-8 pr-8"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSearchChange('')}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
