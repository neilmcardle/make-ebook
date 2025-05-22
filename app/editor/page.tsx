'use client'

import { useRouter } from 'next/navigation'
import { useBookStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Book, Plus, Search } from 'lucide-react'
import { useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const { books, createNewBook, setCurrentBook } = useBookStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreateBook = () => {
    createNewBook()
    router.push('/editor')
  }

  const handleOpenBook = (book: Book) => {
    setCurrentBook(book)
    router.push('/editor')
  }

  const filteredBooks = books.filter(book => 
    book.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.metadata.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Books</h1>
        <Button onClick={handleCreateBook} className="gap-2">
          <Plus className="h-4 w-4" />
          New Book
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books by title or author..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredBooks.length === 0 && searchQuery === '' ? (
        <div className="text-center py-12">
          <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No books yet</h2>
          <p className="text-muted-foreground mb-4">
            Start by creating your first book
          </p>
          <Button onClick={handleCreateBook}>Create a Book</Button>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No books found</h2>
          <p className="text-muted-foreground">
            Try searching with different terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleOpenBook(book)}>
              <CardHeader>
                <CardTitle>{book.metadata.title}</CardTitle>
                <CardDescription>by {book.metadata.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {book.chapters.length} chapters
                </div>
                {book.metadata.description && (
                  <p className="mt-2 text-sm line-clamp-2">
                    {book.metadata.description}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Last modified {formatDistanceToNow(new Date(book.metadata.lastModified), { addSuffix: true })}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}