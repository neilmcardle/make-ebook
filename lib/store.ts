'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Book, BookMetadata, Chapter, Version } from '@/types/book'
import { toast } from 'sonner'

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

const AUTOSAVE_INTERVAL = 5 * 60 * 1000 // 5 minutes

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
              lastModified: "2025-05-22 10:22:05"
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
            lastModified: "2025-05-22 10:22:05"
          }
          const updatedChapters = state.currentBook.chapters.map(ch =>
            ch.id === updatedChapter.id ? updatedChapter : ch
          )
          const updatedBook = {
            ...state.currentBook,
            chapters: updatedChapters,
            metadata: {
              ...state.currentBook.metadata,
              lastModified: "2025-05-22 10:22:05"
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
              ? { ...ch, title, lastModified: "2025-05-22 10:22:05" }
              : ch
          )
          const updatedBook = {
            ...state.currentBook,
            chapters: updatedChapters,
            metadata: {
              ...state.currentBook.metadata,
              lastModified: "2025-05-22 10:22:05"
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
          content: "", // Empty content to show placeholder
          order: 0,
          createdAt: "2025-05-22 10:22:05",
          lastModified: "2025-05-22 10:22:05"
        }
        const newBook: Book = {
          id: crypto.randomUUID(),
          metadata: {
            title: "Untitled Book",
            author: "neilmcardle",
            description: "",
            language: "en",
            isbn: "",
            lastModified: "2025-05-22 10:22:05",
            createdAt: "2025-05-22 10:22:05",
            createdBy: "neilmcardle"
          },
          chapters: [newChapter],
          content: "" // Keep empty for new books
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
            content: "", // Empty content to show placeholder
            order: state.currentBook.chapters.length,
            createdAt: "2025-05-22 10:22:05",
            lastModified: "2025-05-22 10:22:05"
          }
          const updatedBook = {
            ...state.currentBook,
            chapters: [...state.currentBook.chapters, newChapter],
            metadata: {
              ...state.currentBook.metadata,
              lastModified: "2025-05-22 10:22:05"
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
              lastModified: "2025-05-22 10:22:05"
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
            lastModified: ch.id === chapterId ? "2025-05-22 10:22:05" : ch.lastModified
          }))

          const updatedBook = {
            ...state.currentBook,
            chapters: finalChapters,
            metadata: {
              ...state.currentBook.metadata,
              lastModified: "2025-05-22 10:22:05"
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
          timestamp: "2025-05-22 10:22:05",
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
          [state.currentBook.id]: [version, ...bookVersions].slice(0, 50) // Keep last 50 versions
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