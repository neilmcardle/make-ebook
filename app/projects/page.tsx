'use client'

import { useBookStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from 'date-fns'
import { Trash2, FileEdit } from 'lucide-react'
import { DeleteBookDialog } from '@/components/projects/delete-book-dialog'
import { useState } from 'react'

export default function ProjectsPage() {
  const { books, setCurrentBook, deleteBook } = useBookStore()
  const router = useRouter()
  const [bookToDelete, setBookToDelete] = useState<{ id: string, title: string } | null>(null)

  const handleEditBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId)
    if (book) {
      setCurrentBook(book)
      router.push('/editor')
    }
  }

  const handleDeleteBook = (bookId: string, bookTitle: string) => {
    setBookToDelete({ id: bookId, title: bookTitle })
  }

  const confirmDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id)
      setBookToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Books</h1>
        <Button onClick={() => router.push('/editor')}>New Book</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No books created yet. Click &quot;New Book&quot; to get started.
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.metadata.title}</TableCell>
                  <TableCell>{book.metadata.author}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(book.metadata.lastModified), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{book.metadata.language}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditBook(book.id)}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteBook(book.id, book.metadata.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteBookDialog
        open={!!bookToDelete}
        onOpenChange={(open) => !open && setBookToDelete(null)}
        onConfirm={confirmDelete}
        bookTitle={bookToDelete?.title || ''}
      />
    </div>
  )
}