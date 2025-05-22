'use client'

import { useBookStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Grip, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'

export function ChaptersSidebar() {
  const { 
    currentBook, 
    currentChapter,
    createNewChapter, 
    setCurrentChapter,
    updateChapterTitle,
    deleteChapter,
    reorderChapters
  } = useBookStore()
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const handleTitleEdit = (chapterId: string, newTitle: string) => {
    updateChapterTitle(chapterId, newTitle)
    setEditingId(null)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const chapterId = result.draggableId
    const newOrder = result.destination.index

    reorderChapters(chapterId, newOrder)
  }

  if (!currentBook) return null

  return (
    <div className="w-64 border-r p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Chapters</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => createNewChapter()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 flex-1 overflow-auto"
            >
              {currentBook.chapters
                .sort((a, b) => a.order - b.order)
                .map((chapter, index) => (
                  <Draggable
                    key={chapter.id}
                    draggableId={chapter.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md",
                          currentChapter?.id === chapter.id && "bg-muted",
                          snapshot.isDragging && "bg-accent"
                        )}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                        >
                          <Grip className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        {editingId === chapter.id ? (
                          <form
                            className="flex-1"
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleTitleEdit(chapter.id, editingTitle)
                            }}
                          >
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={() => handleTitleEdit(chapter.id, editingTitle)}
                              autoFocus
                            />
                          </form>
                        ) : (
                          <button
                            className="flex-1 text-left text-sm truncate hover:underline"
                            onClick={() => setCurrentChapter(chapter.id)}
                            onDoubleClick={() => {
                              setEditingId(chapter.id)
                              setEditingTitle(chapter.title)
                            }}
                          >
                            {chapter.title}
                          </button>
                        )}

                        {currentBook.chapters.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteChapter(chapter.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}