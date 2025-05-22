'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { History, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBookStore } from '@/lib/store'
import { Version } from '@/types/book'
import { Badge } from '@/components/ui/badge'

export function VersionHistory() {
  const { currentBook, versions, restoreVersion } = useBookStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentBook) return null

  const bookVersions = versions[currentBook.id] || []

  const getVersionBadge = (type: Version['type']) => {
    switch (type) {
      case 'autosave':
        return <Badge variant="secondary">Auto-saved</Badge>
      case 'manual':
        return <Badge variant="default">Saved</Badge>
      case 'metadata':
        return <Badge variant="outline">Metadata</Badge>
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          Version History
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-4">
            {bookVersions.map((version, index) => (
              <div
                key={version.id}
                className="flex flex-col space-y-2 p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getVersionBadge(version.type)}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      restoreVersion(version.id)
                      setIsOpen(false)
                    }}
                  >
                    Restore
                  </Button>
                </div>
                {version.description && (
                  <p className="text-sm text-muted-foreground">
                    {version.description}
                  </p>
                )}
                <div className="text-sm">
                  by {version.user}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}