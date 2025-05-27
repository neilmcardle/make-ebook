import { NextRequest, NextResponse } from 'next/server'
import Epub from 'epub-gen-memory'

export async function POST(req: NextRequest) {
  const book = await req.json()
  const { metadata, chapters } = book

  const epubChapters = chapters
    .sort((a, b) => a.order - b.order)
    .map(ch => ({
      title: ch.title,
      data: ch.content || '',
    }))

  const options = {
    title: metadata.title || 'Untitled Book',
    author: metadata.author || 'Unknown',
    language: metadata.language || 'en',
    description: metadata.description || '',
    publisher: metadata.publisher || '',
    cover: metadata.coverImage || undefined,
    output: undefined,
    content: epubChapters,
  }

  const epub = await Epub(options)
  return new NextResponse(epub, {
    headers: {
      'Content-Type': 'application/epub+zip',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.title || 'book')}.epub"`,
    },
  })
}