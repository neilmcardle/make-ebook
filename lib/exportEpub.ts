export async function exportBookAsEpub(book: any) {
  const res = await fetch('/api/export-epub', {
    method: 'POST',
    body: JSON.stringify(book),
    headers: { 'Content-Type': 'application/json' },
  })
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${book.metadata.title || 'book'}.epub`
  a.click()
  window.URL.revokeObjectURL(url)
}