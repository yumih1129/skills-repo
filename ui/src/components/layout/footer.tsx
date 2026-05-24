import { Github } from 'lucide-react'
import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{siteConfig.footer.text}</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={siteConfig.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>{siteConfig.footer.repoName}</span>
            </a>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground/60">{siteConfig.footer.license}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
