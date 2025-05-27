'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Save, Plus, Trash, Pencil, Menu, GripVertical, BookOpen } from 'lucide-react'
import BookMetadataDialog from '@/components/BookMetadataDialog'
import { exportBookAsEpub } from '@/lib/exportEpub'

export default function EditorPage() {
  const router = useRouter()
  const {
    currentBook,
    currentChapter,
    setCurrentBook,
    setCurrentChapter,
    updateBookMetadata,
    updateChapterContent,
    updateChapterTitle,
    createNewChapter,
    deleteChapter,
    reorderChapters,
    saveBook,
    books,
  } = useBookStore()
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false)
  const [metadataDraft, setMetadataDraft] = useState(currentBook?.metadata)
  const [chapterContent, setChapterContent] = useState(currentChapter?.content || '')
  const [chapterTitleDraft, setChapterTitleDraft] = useState(currentChapter?.title || '')

  // Sync chapter content and title when switching chapters
  useEffect(() => {
    setChapterContent(currentChapter?.content || '')
    setChapterTitleDraft(currentChapter?.title || '')
  }, [currentChapter])

  // If no current book, redirect to dashboard
  useEffect(() => {
    if (!currentBook) {
      router.replace('/')
    }
    setMetadataDraft(currentBook?.metadata)
  }, [currentBook, router])

  if (!currentBook) {
    return null
  }

  // Handlers
  const handleChapterSelect = (chapterId: string) => {
    setCurrentChapter(chapterId)
  }

  const handleChapterContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChapterContent(e.target.value)
  }

  const handleChapterTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChapterTitleDraft(e.target.value)
  }

  const handleChapterTitleBlur = () => {
    if (chapterTitleDraft !== currentChapter?.title && currentChapter?.id) {
      updateChapterTitle(currentChapter.id, chapterTitleDraft)
      saveBook('manual', 'Updated chapter title')
    }
  }

  const handleSaveContent = () => {
    updateChapterContent(chapterContent)
    saveBook('manual', 'Updated chapter content')
  }

  const handleAddChapter = () => {
    createNewChapter()
  }

  const handleDeleteChapter = () => {
    if (currentChapter?.id) {
      deleteChapter(currentChapter.id)
    }
  }

  const handleReorderChapter = (direction: 'up' | 'down') => {
    if (!currentBook || !currentChapter) return
    const idx = currentBook.chapters.findIndex(ch => ch.id === currentChapter.id)
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === currentBook.chapters.length - 1)
    ) {
      return
    }
    const newOrder = direction === 'up' ? idx - 1 : idx + 1
    reorderChapters(currentChapter.id, newOrder)
  }

  const handleMetadataEdit = () => {
    setMetadataDraft(currentBook.metadata)
    setMetadataDialogOpen(true)
  }

  const handleMetadataSave = (metadata: any) => {
    updateBookMetadata(metadata)
    setMetadataDialogOpen(false)
  }

  const handleBack = () => {
    setCurrentBook(null)
    router.push('/')
  }

  const handleExportEpub = async () => {
    await exportBookAsEpub(currentBook)
  }

  return (
    <div className="container mx-auto py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{currentBook.metadata.title || 'Untitled Book'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportEpub}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            title="Export EPUB"
          >
            <BookOpen className="w-4 h-4" />
            <span>Export EPUB</span>
          </Button>
          <span className="text-xs text-muted-foreground">
            Last modified{' '}
            {formatDistanceToNow(new Date(currentBook.metadata.lastModified), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Book Metadata Quick View */}
      <div className="bg-muted rounded px-4 py-2 mb-6 flex items-center gap-3">
        <div>
          <span className="font-medium">Author:</span> {currentBook.metadata.author}{' '}
          <span className="mx-2 text-muted-foreground">|</span>
          <span className="font-medium">Language:</span> {currentBook.metadata.language}{' '}
          <span className="mx-2 text-muted-foreground">|</span>
          <span className="font-medium">ISBN:</span> {currentBook.metadata.isbn}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="ml-2 flex items-center gap-1"
          title="Edit book metadata"
          onClick={handleMetadataEdit}
        >
          <Pencil className="w-4 h-4" />
          <span>Edit Metadata</span>
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Chapter List */}
        <div className="min-w-[220px] w-1/4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Chapters</span>
            <Button variant="outline" size="sm" onClick={handleAddChapter}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          <div>
            {currentBook.chapters
              .sort((a, b) => a.order - b.order)
              .map((ch, idx) => (
                <Card
                  key={ch.id}
                  className={`mb-2 cursor-pointer ${
                    currentChapter?.id === ch.id ? 'border-primary border-2' : ''
                  }`}
                  onClick={() => handleChapterSelect(ch.id)}
                >
                  <CardHeader className="p-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">{ch.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardFooter className="px-2 pb-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ch.lastModified), { addSuffix: true })}
                    </span>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1">
          {currentChapter ? (
            <Card>
              <CardHeader>
                <Input
                  className="text-lg font-semibold"
                  value={chapterTitleDraft}
                  onChange={handleChapterTitleChange}
                  onBlur={handleChapterTitleBlur}
                  placeholder="Chapter Title"
                />
              </CardHeader>
              <CardContent>
                <textarea
                  value={chapterContent}
                  onChange={handleChapterContentChange}
                  placeholder="Write your chapter here..."
                  className="w-full h-64 p-2 border rounded"
                  rows={16}
                />
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteChapter}>
                    <Trash className="w-4 h-4 mr-2" /> Delete Chapter
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleReorderChapter('up')}
                    title="Move chapter up"
                  >
                    <Menu className="w-4 h-4 rotate-180" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleReorderChapter('down')}
                    title="Move chapter down"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleSaveContent}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground py-24">
              <p>Select or create a chapter to start editing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Book Metadata Dialog */}
      <BookMetadataDialog
        open={metadataDialogOpen}
        onOpenChange={setMetadataDialogOpen}
        metadata={metadataDraft || currentBook.metadata}
        onSave={handleMetadataSave}
      />
    </div>
  )
}