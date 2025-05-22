export interface Chapter {
  id: string
  title: string
  content: string
  order: number
  createdAt: string
  lastModified: string
}

export interface BookMetadata {
  title: string
  author: string
  description: string
  language: string
  isbn: string
  lastModified: string
  createdAt: string
  createdBy: string
}

export interface Book {
  id: string
  metadata: BookMetadata
  chapters: Chapter[]
  content: string
}

export interface Version {
  id: string
  timestamp: string
  user: string
  type: 'autosave' | 'manual' | 'metadata'
  content?: string
  metadata?: BookMetadata
  chapterId?: string
  description?: string
}

export interface BookVersion {
  bookId: string
  versions: Version[]
}