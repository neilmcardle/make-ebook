import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Book } from '@/types/book'
import { ExportSettings } from '@/types/settings'
import { sanitizeFilename } from '@/lib/utils'

export async function exportBook(book: Book, settings: ExportSettings) {
  const timestamp = '2025-05-21-13-01-49'
  const sanitizedTitle = sanitizeFilename(book.metadata.title)
  
  switch (settings.format) {
    case 'epub':
      return exportEpub(book, settings, sanitizedTitle, timestamp)
    case 'pdf':
      return exportPdf(book, settings, sanitizedTitle, timestamp)
    case 'markdown':
      return exportMarkdown(book, sanitizedTitle, timestamp)
    default:
      throw new Error('Unsupported export format')
  }
}

async function exportEpub(
  book: Book, 
  settings: ExportSettings, 
  sanitizedTitle: string,
  timestamp: string
) {
  const zip = new JSZip()
  
  // Add mimetype file (must be first and uncompressed)
  zip.file('mimetype', 'application/epub+zip')
  
  // Add META-INF directory
  const metaInf = zip.folder('META-INF')
  metaInf?.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
      </rootfiles>
    </container>`)
  
  // Add OEBPS directory
  const oebps = zip.folder('OEBPS')
  
  // Add content
  oebps?.file('chapter1.xhtml', `<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
      <head>
        <title>${book.metadata.title}</title>
      </head>
      <body>
        ${book.content}
      </body>
    </html>`)
  
  // Add content.opf
  oebps?.file('content.opf', generateContentOpf(book))
  
  // Add toc.ncx if enabled
  if (settings.includeTableOfContents) {
    oebps?.file('toc.ncx', generateTocNcx(book))
  }
  
  // Generate and save the file
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })
  
  saveAs(content, `${sanitizedTitle}-${timestamp}.epub`)
}

async function exportPdf(
  book: Book, 
  settings: ExportSettings,
  sanitizedTitle: string,
  timestamp: string
) {
  // For now, we'll create a simple HTML that can be printed to PDF
  const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>${book.metadata.title}</title>
        <style>
          @page {
            size: ${settings.pageSize || 'A4'};
            margin: ${getMarginSize(settings.marginSize)};
          }
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        ${settings.includeCover ? generateCoverPage(book) : ''}
        ${settings.includeTableOfContents ? generateTableOfContents(book) : ''}
        ${book.content}
      </body>
    </html>`

  const blob = new Blob([html], { type: 'text/html' })
  saveAs(blob, `${sanitizedTitle}-${timestamp}.html`)
}

async function exportMarkdown(
  book: Book,
  sanitizedTitle: string,
  timestamp: string
) {
  // Convert HTML to Markdown (basic conversion)
  const markdown = `# ${book.metadata.title}

Author: ${book.metadata.author}
Language: ${book.metadata.language}
Created: ${book.metadata.createdAt}
Last Modified: ${book.metadata.lastModified}

${htmlToMarkdown(book.content)}
`

  const blob = new Blob([markdown], { type: 'text/markdown' })
  saveAs(blob, `${sanitizedTitle}-${timestamp}.md`)
}

function generateContentOpf(book: Book): string {
  return `<?xml version="1.0" encoding="utf-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:identifier id="book-id">urn:uuid:${crypto.randomUUID()}</dc:identifier>
        <dc:title>${book.metadata.title}</dc:title>
        <dc:creator>${book.metadata.author}</dc:creator>
        <dc:language>${book.metadata.language}</dc:language>
        <dc:date>${book.metadata.lastModified}</dc:date>
        <meta property="dcterms:modified">${book.metadata.lastModified}</meta>
      </metadata>
      <manifest>
        <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
      </manifest>
      <spine toc="ncx">
        <itemref idref="chapter1"/>
      </spine>
    </package>`
}

function generateTocNcx(book: Book): string {
  return `<?xml version="1.0" encoding="utf-8"?>
    <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
      <head>
        <meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
      </head>
      <docTitle>
        <text>${book.metadata.title}</text>
      </docTitle>
      <navMap>
        <navPoint id="navpoint-1" playOrder="1">
          <navLabel>
            <text>${book.metadata.title}</text>
          </navLabel>
          <content src="chapter1.xhtml"/>
        </navPoint>
      </navMap>
    </ncx>`
}

function generateCoverPage(book: Book): string {
  return `<div style="page-break-after: always;">
    <h1 style="font-size: 2em; text-align: center; margin-top: 50%;">
      ${book.metadata.title}
    </h1>
    <p style="text-align: center; margin-top: 2em;">
      By ${book.metadata.author}
    </p>
  </div>`
}

function generateTableOfContents(book: Book): string {
  return `<div style="page-break-after: always;">
    <h2>Table of Contents</h2>
    <ul>
      <li><a href="#chapter1">Chapter 1</a></li>
    </ul>
  </div>`
}

function getMarginSize(size?: string): string {
  switch (size) {
    case 'small':
      return '1.5cm'
    case 'large':
      return '3cm'
    case 'medium':
    default:
      return '2.5cm'
  }
}

function htmlToMarkdown(html: string): string {
  // Basic HTML to Markdown conversion
  return html
    .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<ul>(.*?)<\/ul>/g, '$1\n')
    .replace(/<li>(.*?)<\/li>/g, '- $1\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/&nbsp;/g, ' ')
}