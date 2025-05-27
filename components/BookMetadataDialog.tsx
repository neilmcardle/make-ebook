'use client'

import { useState, useEffect, useRef } from 'react'
import { BookMetadata } from '@/types/BookMetadata'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon } from 'lucide-react'

type BookMetadataDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  metadata: BookMetadata
  onSave: (metadata: BookMetadata) => void
}

export default function BookMetadataDialog({
  open,
  onOpenChange,
  metadata,
  onSave,
}: BookMetadataDialogProps) {
  const [draft, setDraft] = useState<BookMetadata>({ ...metadata })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setDraft({ ...metadata })
    }
  }, [open, metadata])

  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setDraft(d => ({
        ...d,
        coverImage: evt.target?.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    onSave(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Book Metadata (EPUB)</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            {draft.coverImage ? (
              <img
                src={draft.coverImage}
                alt="Book cover"
                className="rounded shadow max-h-64 max-w-xs border bg-white"
                style={{ objectFit: 'cover', width: '200px', height: '320px' }}
              />
            ) : (
              <div
                className="rounded shadow max-h-64 max-w-xs border flex items-center justify-center bg-muted text-muted-foreground"
                style={{ width: '200px', height: '320px' }}
              >
                No Cover
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverInputChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 rounded-full shadow-lg"
              style={{ zIndex: 10 }}
              title={draft.coverImage ? "Change Cover" : "Upload Cover"}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Recommended size: 1600 × 2560 px (Portrait, JPEG/PNG)
          </div>
        </div>
        <div className="space-y-3">
          <Input
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            placeholder="Title"
            required
          />
          <Input
            value={draft.creator}
            onChange={e => setDraft(d => ({ ...d, creator: e.target.value }))}
            placeholder="Author/Creator"
            required
          />
          <Input
            value={draft.language}
            onChange={e => setDraft(d => ({ ...d, language: e.target.value }))}
            placeholder="Language (e.g. en, en-US)"
            required
          />
          <Input
            value={draft.identifier}
            onChange={e => setDraft(d => ({ ...d, identifier: e.target.value }))}
            placeholder="Identifier (ISBN, UUID, etc)"
            required
          />
          <Input
            value={draft.publisher}
            onChange={e => setDraft(d => ({ ...d, publisher: e.target.value }))}
            placeholder="Publisher"
          />
          <Textarea
            value={draft.description}
            onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            placeholder="Description"
            rows={2}
          />
          <Input
            value={draft.subject}
            onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))}
            placeholder="Subject (comma-separated keywords)"
          />
          <Input
            value={draft.date}
            onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
            placeholder="Publication Date"
            type="date"
          />
          <Input
            value={draft.rights}
            onChange={e => setDraft(d => ({ ...d, rights: e.target.value }))}
            placeholder="Rights/Copyright"
          />
          <Input
            value={draft.contributor || ''}
            onChange={e => setDraft(d => ({ ...d, contributor: e.target.value }))}
            placeholder="Contributor (optional)"
          />
          <Input
            value={draft.type || ''}
            onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
            placeholder="Type (usually 'Text')"
          />
          <Input
            value={draft.format || ''}
            onChange={e => setDraft(d => ({ ...d, format: e.target.value }))}
            placeholder="Format (usually 'application/epub+zip')"
          />
          <Input
            value={draft.source || ''}
            onChange={e => setDraft(d => ({ ...d, source: e.target.value }))}
            placeholder="Source (optional)"
          />
          <Input
            value={draft.relation || ''}
            onChange={e => setDraft(d => ({ ...d, relation: e.target.value }))}
            placeholder="Relation (optional)"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}