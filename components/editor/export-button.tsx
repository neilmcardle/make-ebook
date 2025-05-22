'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBookStore } from "@/lib/store"
import { useSettingsStore } from "@/lib/settings-store"
import { exportBook } from "@/lib/export-service"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function ExportButton() {
  const { currentBook } = useBookStore()
  const { settings } = useSettingsStore()

  const handleExport = async (format: 'epub' | 'pdf' | 'markdown') => {
    if (!currentBook) return

    try {
      await exportBook(currentBook, {
        ...settings.export,
        format
      })
      toast.success(`Successfully exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(`Failed to export as ${format.toUpperCase()}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('epub')}>
          Export as EPUB
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          Export as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}