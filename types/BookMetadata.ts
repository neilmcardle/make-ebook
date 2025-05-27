// EPUB 3.2 (and EPUB 2) recommended metadata fields

export type BookMetadata = {
  title: string                // <dc:title> - required
  creator: string              // <dc:creator> - required (author)
  language: string             // <dc:language> - required (RFC 5646)
  identifier: string           // <dc:identifier> - required (ISBN, UUID, or other)
  publisher: string            // <dc:publisher> - recommended
  description: string          // <dc:description> - recommended
  subject: string              // <dc:subject> - recommended (comma-separated tags)
  date: string                 // <dc:date> - recommended (ISO 8601 YYYY-MM-DD)
  rights: string               // <dc:rights> - recommended (copyright statement)
  coverImage?: string          // Not a metadata field but used for <meta name="cover"> (base64 or URL)
  contributor?: string         // <dc:contributor> - optional
  type?: string                // <dc:type> - optional (usually "Text")
  format?: string              // <dc:format> - optional (usually "application/epub+zip")
  source?: string              // <dc:source> - optional
  relation?: string            // <dc:relation> - optional
}