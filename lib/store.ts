'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BookMetadata } from '@/types/BookMetadata'
import { toast } from 'sonner'

// Updated Chapter type (add createdAt, lastModified if missing)
export type Chapter = {
  id: string
  title: string
  content: string
  order: number
  createdAt: string
  lastModified: string
}

// Updated Book type with new BookMetadata
export type Book = {
  id: string
  metadata: BookMetadata
  chapters: Chapter[]
}

// Version history type (optional)
export type Version = {
  id: string
  timestamp: string
  user: string
  type: 'manual' | 'metadata' | 'autosave'
  content: string
  metadata: BookMetadata
  chapterId: string
  description?: string
}

interface BookStore {
  currentBook: Book | null
  currentChapter: Chapter | null
  books: Book[]
  versions: Record<string, Version[]>
  lastSaved: string | null
  setCurrentBook: (book: Book) => void
  setCurrentChapter: (chapterId: string) => void
  updateBookMetadata: (metadata: BookMetadata) => void
  updateChapterContent: (content: string) => void
  updateChapterTitle: (chapterId: string, title: string) => void
  createNewBook: () => void
  createNewChapter: () => void
  deleteChapter: (chapterId: string) => void
  reorderChapters: (chapterId: string, newOrder: number) => void
  deleteBook: (id: string) => void
  saveBook: (type: 'manual' | 'metadata' | 'autosave', description?: string) => void
  restoreVersion: (versionId: string) => void
}

function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      currentBook: null,
      currentChapter: null,
      books: [],
      versions: {},
      lastSaved: null,

      setCurrentBook: (book) => set({ 
        currentBook: book,
        currentChapter: book.chapters[0] || null
      }),

      setCurrentChapter: (chapterId) => 
        set((state) => ({
          currentChapter: state.currentBook?.chapters.find(ch => ch.id === chapterId) || null
        })),

      updateBookMetadata: (metadata) => 
        set((state) => {
          if (!state.currentBook) return state
          const updatedBook = {
            ...state.currentBook,
            metadata: {
              ...metadata,
            }
          }
          const updatedBooks = state.books.map(book => 
            book.id === updatedBook.id ? updatedBook : book
          )
          return {
            currentBook: updatedBook,
            books: updatedBooks
          }
        }),

      updateChapterContent: (content) =>
        set((state) => {
          if (!state.currentBook || !state.currentChapter) return state
          const updatedChapter = {
            ...state.currentChapter,
            content,
            lastModified: now()
          }
          const updatedChapters = state.currentBook.chapters.map(ch =>
            ch.id === updatedChapter.id ? updatedChapter : ch
          )
          const updatedBook = {
            ...state.currentBook,
            chapters: updatedChapters,
            metadata: {
              ...state.currentBook.metadata,
              date: now().slice(0,10),
            }
          }
          const updatedBooks = state.books.map(book =>
            book.id === updatedBook.id ? updatedBook : book
          )
          return {
            currentBook: updatedBook,
            currentChapter: updatedChapter,
            books: updatedBooks
          }
        }),

      updateChapterTitle: (chapterId, title) =>
        set((state) => {
          if (!state.currentBook) return state
          const updatedChapters = state.currentBook.chapters.map(ch =>
            ch.id === chapterId
              ? { ...ch, title, lastModified: now() }
              : ch
          )
          const updatedBook = {
            ...state.currentBook,
            chapters: updatedChapters,
            metadata: {
              ...state.currentBook.metadata,
              date: now().slice(0,10),
            }
          }
          const updatedBooks = state.books.map(book =>
            book.id === updatedBook.id ? updatedBook : book
          )
          return {
            currentBook: updatedBook,
            currentChapter: state.currentChapter?.id === chapterId
              ? { ...state.currentChapter, title }
              : state.currentChapter,
            books: updatedBooks
          }
        }),

      createNewBook: () => {
        const newChapter: Chapter = {
          id: crypto.randomUUID(),
          title: "Chapter 1",
          content: "",
          order: 0,
          createdAt: now(),
          lastModified: now()
        }
        const newBook: Book = {
          id: crypto.randomUUID(),
          metadata: {
            title: "Untitled Book",
            creator: "neilmcardle",
            language: "en",
            identifier: crypto.randomUUID(),
            publisher: "",
            description: "",
            subject: "",
            date: now().slice(0,10),
            rights: "",
            coverImage: "",
            contributor: "",
            type: "Text",
            format: "application/epub+zip",
            source: "",
            relation: "",
          },
          chapters: [newChapter]
        }
        set((state) => ({
          currentBook: newBook,
          currentChapter: newChapter,
          books: [...state.books, newBook]
        }))
      },

      createNewChapter: () =>
        set((state) => {
          if (!state.currentBook) return state
          const newChapter: Chapter = {
            id: crypto.randomUUID(),
            title: `Chapter ${state.currentBook.chapters.length + 1}`,
            content: "",
            order: state.currentBook.chapters.length,
            createdAt: now(),
            lastModified: now()
          }
          const updatedBook = {
            ...state.currentBook,
            chapters: [...state.currentBook.chapters, newChapter],
            metadata: {
              ...state.currentBook.metadata,
              date: now().slice(0,10),
            }
          }
          const updatedBooks = state.books.map(book =>
            book.id === updatedBook.id ? updatedBook : book
          )
          return {
            currentBook: updatedBook,
            currentChapter: newChapter,
            books: updatedBooks
          }
        }),

      deleteChapter: (chapterId) =>
        set((state) => {
          if (!state.currentBook) return state
          const updatedChapters = state.currentBook.chapters
            .filter(ch => ch.id !== chapterId)
            .map((ch, idx) => ({ ...ch, order: idx }))
          const updatedBook = {
            ...state.currentBook,
            chapters: updatedChapters,
            metadata: {
              ...state.currentBook.metadata,
              date: now().slice(0,10),
            }
          }
          const updatedBooks = state.books.map(book =>
            book.id === updatedBook.id ? updatedBook : book
          )
          return {
            currentBook: updatedBook,
            currentChapter: state.currentChapter?.id === chapterId
              ? updatedChapters[0] || null
              : state.currentChapter,
            books: updatedBooks
          }
        }),

      reorderChapters: (chapterId, newOrder) =>
        set((state) => {
          if (!state.currentBook) return state
          const chapter = state.currentBook.chapters.find(ch => ch.id === chapterId)
          if (!chapter) return state

          const updatedChapters = state.currentBook.chapters
            .filter(ch => ch.id !== chapterId)
            .sort((a, b) => a.order - b.order)
          updatedChapters.splice(newOrder, 0, chapter)
          const finalChapters = updatedChapters.map((ch, idx) => ({
            ...ch,
            order: idx,
            lastModified: ch.id === chapterId ? now() : ch.lastModified
          }))
          const updatedBook = {
            ...state.currentBook,
            chapters: finalChapters,
            metadata: {
              ...state.currentBook.metadata,
              date: now().slice(0,10),
            }
          }
          const updatedBooks = state.books.map(book =>
            book.id === updatedBook.id ? updatedBook : book
          )
          return {
            currentBook: updatedBook,
            books: updatedBooks
          }
        }),

      deleteBook: (id) => 
        set((state) => {
          const updatedBooks = state.books.filter(book => book.id !== id)
          return {
            books: updatedBooks,
            currentBook: state.currentBook?.id === id ? null : state.currentBook,
            currentChapter: state.currentBook?.id === id ? null : state.currentChapter
          }
        }),

      saveBook: (type, description) => {
        const state = get()
        if (!state.currentBook || !state.currentChapter) return

        const version: Version = {
          id: crypto.randomUUID(),
          timestamp: now(),
          user: "neilmcardle",
          type,
          content: state.currentChapter.content,
          metadata: state.currentBook.metadata,
          chapterId: state.currentChapter.id,
          description
        }

        const bookVersions = state.versions[state.currentBook.id] || []
        const updatedVersions = {
          ...state.versions,
          [state.currentBook.id]: [version, ...bookVersions].slice(0, 50)
        }

        set({ 
          versions: updatedVersions,
          lastSaved: version.timestamp
        })

        if (type === 'manual') {
          toast.success('Changes saved successfully')
        } else if (type === 'autosave') {
          toast.success('Auto-saved changes')
        }
      },

      restoreVersion: (versionId) => {
        const state = get()
        if (!state.currentBook) return

        const bookVersions = state.versions[state.currentBook.id] || []
        const version = bookVersions.find(v => v.id === versionId)
        if (!version) return

        const updatedBook = {
          ...state.currentBook,
          metadata: version.metadata || state.currentBook.metadata,
        }

        if (version.content && version.chapterId) {
          const updatedChapters = state.currentBook.chapters.map(ch =>
            ch.id === version.chapterId
              ? { ...ch, content: version.content }
              : ch
          )
          updatedBook.chapters = updatedChapters
        }

        const updatedBooks = state.books.map(book =>
          book.id === updatedBook.id ? updatedBook : book
        )

        set({
          currentBook: updatedBook,
          books: updatedBooks,
        })

        toast.success('Version restored successfully')
      }
    }),
    {
      name: 'book-storage'
    }
  )
)