'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBookStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import {
  Save,
  Plus,
  Trash,
  Pencil,
  GripVertical,
  BookOpen,
} from 'lucide-react'
import { exportBookAsEpub } from '@/lib/exportEpub'
import { Editor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BookMetadata } from '@/types/BookMetadata'
import './editor.css'

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
  } = useBookStore()
  const [chapterContent, setChapterContent] = useState(currentChapter?.content || '')
  const [chapterTitleDraft, setChapterTitleDraft] = useState(currentChapter?.title || '')
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize editor on chapterContent change (fixes Tiptap focus bug)
  useEffect(() => {
    if (editor) {
      editor.destroy()
    }
    const newEditor = new Editor({
      extensions: [StarterKit],
      content: chapterContent,
      autofocus: true,
      onUpdate: ({ editor }) => {
        setChapterContent(editor.getHTML())
      },
    })
    newEditor.on('focus', () => setIsEditorFocused(true))
    newEditor.on('blur', () => setIsEditorFocused(false))
    setEditor(newEditor)
    return () => {
      newEditor?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterContent])

  // Sync chapter content and title when switching chapters
  useEffect(() => {
    setChapterContent(currentChapter?.content || '')
    setChapterTitleDraft(currentChapter?.title || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapter])

  // If no current book, redirect to dashboard
  useEffect(() => {
    if (!currentBook) {
      router.replace('/')
    }
  }, [currentBook, router])

  if (!currentBook) {
    return null
  }

  // Handlers
  const handleChapterSelect = (chapterId: string) => {
    setCurrentChapter(chapterId)
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

  const handleExportEpub = async () => {
    await exportBookAsEpub(currentBook)
  }

  // TIPTAP Toolbar (basic example)
  const TiptapMenuBar = () => {
    if (!editor) return null
    return (
      <div className="mb-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
        <Button
          type="button"
          variant={editor.isActive('strike') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          Strike
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet List
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered List
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Cover Thumbnail (now links to full metadata editor) */}
          <Link href="/editor/metadata" className="relative group" title="Edit Metadata">
            {currentBook.metadata.coverImage ? (
              <img
                src={currentBook.metadata.coverImage}
                alt="Book cover"
                className="rounded border object-cover w-10 h-16 shadow-sm cursor-pointer"
              />
            ) : (
              <div
                className="rounded border bg-muted text-muted-foreground flex items-center justify-center w-10 h-16 shadow-sm cursor-pointer"
              >
                <span className="text-xs">No Cover</span>
              </div>
            )}
            <span
              className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow group-hover:opacity-100 opacity-0 transition"
              style={{ pointerEvents: 'none' }}
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </span>
          </Link>
          <h1 className="text-2xl font-bold">{currentBook.metadata.title || 'Untitled Book'}</h1>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
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
          {/* Edit Metadata button on far right */}
          <Link href="/editor/metadata">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 ml-2"
              title="Edit Metadata"
            >
              <Pencil className="w-4 h-4 inline-block mr-1" />
              Edit Metadata
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground ml-4">
            Last modified{' '}
            {currentBook.metadata.date
              ? formatDistanceToNow(new Date(currentBook.metadata.date), { addSuffix: true })
              : 'never'}
          </span>
        </div>
      </div>

      {/* Book Metadata Quick View */}
      <div className="bg-muted rounded px-4 py-2 mb-6 flex items-center gap-3">
        <div>
          <span className="font-medium">Author:</span> {currentBook.metadata.creator}{' '}
          <span className="mx-2 text-muted-foreground">|</span>
          <span className="font-medium">Language:</span> {currentBook.metadata.language}{' '}
          <span className="mx-2 text-muted-foreground">|</span>
          <span className="font-medium">Identifier:</span> {currentBook.metadata.identifier}
        </div>
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
                <TiptapMenuBar />
                {/* Editor Container with click-to-focus */}
                <div
                  className={`min-h-[300px] px-2 py-2 transition-all border rounded bg-white ${
                    isEditorFocused ? 'border-black' : 'border-muted'
                  } editor-container`}
                  style={{ cursor: 'text' }}
                  onClick={() => editor && editor.commands.focus()}
                >
                  {editor && <EditorContent editor={editor} />}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div>
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
                    <Trash className="w-4 h-4 mr-2" /> Delete Chapter
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveContent}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                </div>
                {confirmDeleteOpen && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <div className="bg-white rounded shadow p-6 max-w-sm w-full">
                      <h2 className="font-bold text-lg mb-2">Delete Chapter?</h2>
                      <p className="mb-4">Are you sure you want to delete this chapter? This action cannot be undone.</p>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDeleteChapter()
                            setConfirmDeleteOpen(false)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground py-24">
              <p>Select or create a chapter to start editing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}