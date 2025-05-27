import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BookMetadata } from '@/types/book'

type Props = {
  open: boolean
  onOpenChange: (val: boolean) => void
  metadata: BookMetadata
  onSave: (metadata: BookMetadata) => void
}

export default function BookMetadataDialog({ open, onOpenChange, metadata, onSave }: Props) {
  const [form, setForm] = useState<BookMetadata>({ ...metadata })

  useEffect(() => {
    setForm({ ...metadata })
  }, [metadata])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Book Metadata</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
          <Input name="author" value={form.author} onChange={handleChange} placeholder="Author" required />
          <Input name="language" value={form.language} onChange={handleChange} placeholder="Language (e.g. en)" required />
          <Input name="isbn" value={form.isbn || ''} onChange={handleChange} placeholder="ISBN" />
          <Input name="publisher" value={form.publisher || ''} onChange={handleChange} placeholder="Publisher" />
          <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full" />
          <Input
            name="subject"
            value={Array.isArray(form.subject) ? form.subject.join(', ') : (form.subject || '')}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value.split(',').map(s => s.trim()) }))}
            placeholder="Subjects (comma separated)"
          />
          <Input name="rights" value={form.rights || ''} onChange={handleChange} placeholder="Rights (Copyright statement)" />
          <Input name="date" value={form.date || ''} onChange={handleChange} placeholder="Date (YYYY-MM-DD)" type="date" />
          <Input name="coverImage" value={form.coverImage || ''} onChange={handleChange} placeholder="Cover Image URL" />
          <Input
            name="contributors"
            value={Array.isArray(form.contributors) ? form.contributors.join(', ') : (form.contributors || '')}
            onChange={e => setForm(f => ({ ...f, contributors: e.target.value.split(',').map(s => s.trim()) }))}
            placeholder="Contributors (comma separated)"
          />
          <Input name="source" value={form.source || ''} onChange={handleChange} placeholder="Source" />
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}