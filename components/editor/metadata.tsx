'use client'

import { useRouter } from 'next/navigation'
import { useBookStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BookMetadata } from '@/types/BookMetadata'
import { useState, useEffect } from 'react'

export default function Metadata() {
  const router = useRouter()
  const { currentBook, updateBookMetadata, saveBook } = useBookStore()
  const [draft, setDraft] = useState<BookMetadata | null>(null)

  useEffect(() => {
    if (currentBook) {
      setDraft({ ...currentBook.metadata })
    }
  }, [currentBook])

  if (!currentBook || !draft) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground">No book selected.</p>
        <Button className="mt-4" onClick={() => router.push('/')}>Back to Dashboard</Button>
      </div>
    )
  }

  const handleChange = (field: keyof BookMetadata, value: string) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setDraft((prev) => prev ? { ...prev, coverImage: evt.target?.result as string } : prev)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (draft) {
      updateBookMetadata(draft)
      saveBook('manual', 'Updated full book metadata')
      router.push('/editor')
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Book Metadata</h1>
        <Button variant="outline" onClick={() => router.push('/editor')}>Back to Editor</Button>
      </div>

      <form onSubmit={e => { e.preventDefault(); handleSave() }}>
        <div className="mb-6 flex flex-col items-center">
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
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="cover-upload"
            />
            <label htmlFor="cover-upload">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute bottom-2 right-2 rounded-full shadow-lg"
                style={{ zIndex: 10 }}
                tabIndex={-1}
                title={draft.coverImage ? "Change Cover" : "Upload Cover"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </label>
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Recommended size: 1600 × 2560 px (Portrait, JPEG/PNG)
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="title">Title *</label>
            <Input
              id="title"
              value={draft.title}
              onChange={e => handleChange('title', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="creator">Author/Creator *</label>
            <Input
              id="creator"
              value={draft.creator}
              onChange={e => handleChange('creator', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="language">Language *</label>
            <Input
              id="language"
              value={draft.language}
              onChange={e => handleChange('language', e.target.value)}
              placeholder="e.g. en, en-US"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="identifier">Identifier *</label>
            <Input
              id="identifier"
              value={draft.identifier}
              onChange={e => handleChange('identifier', e.target.value)}
              placeholder="ISBN or UUID"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="publisher">Publisher</label>
            <Input
              id="publisher"
              value={draft.publisher}
              onChange={e => handleChange('publisher', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="description">Description</label>
            <Textarea
              id="description"
              value={draft.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="subject">Subject</label>
            <Input
              id="subject"
              value={draft.subject}
              onChange={e => handleChange('subject', e.target.value)}
              placeholder="Comma-separated keywords"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="date">Publication Date</label>
            <Input
              id="date"
              type="date"
              value={draft.date}
              onChange={e => handleChange('date', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="rights">Rights / Copyright</label>
            <Input
              id="rights"
              value={draft.rights}
              onChange={e => handleChange('rights', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="contributor">Contributor</label>
            <Input
              id="contributor"
              value={draft.contributor || ''}
              onChange={e => handleChange('contributor', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="type">Type</label>
            <Input
              id="type"
              value={draft.type || ''}
              onChange={e => handleChange('type', e.target.value)}
              placeholder="Usually 'Text'"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="format">Format</label>
            <Input
              id="format"
              value={draft.format || ''}
              onChange={e => handleChange('format', e.target.value)}
              placeholder="Usually 'application/epub+zip'"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="source">Source</label>
            <Input
              id="source"
              value={draft.source || ''}
              onChange={e => handleChange('source', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="relation">Relation</label>
            <Input
              id="relation"
              value={draft.relation || ''}
              onChange={e => handleChange('relation', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-8 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push('/editor')}>Cancel</Button>
          <Button type="submit">Save Metadata</Button>
        </div>
      </form>
    </div>
  )
}