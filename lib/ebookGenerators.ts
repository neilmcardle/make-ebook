"use client"

import type { FormData } from "@/components/EbookForm"
import JSZip from "jszip"

// Function to sanitize filenames
const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
}

// Function to convert image to base64
const imageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Function to download a blob
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

export async function generateEpub(formData: FormData): Promise<void> {
  try {
    // Create a new JSZip instance
    const zip = new JSZip()

    // Generate a single UUID to use throughout the ePub
    const bookUUID = crypto.randomUUID()

    // Add mimetype file (must be first and uncompressed)
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" })

    // Add META-INF directory and container.xml
    const metaInf = zip.folder("META-INF")
    metaInf?.file(
      "container.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
    )

    // Create OEBPS folder
    const oebps = zip.folder("OEBPS")
    const images = oebps?.folder("images")

    // Add CSS
    oebps?.file(
      "stylesheet.css",
      `
body {
  font-family: serif;
  margin: 5%;
  text-align: justify;
}
h1, h2, h3, h4 {
  text-align: center;
  font-family: sans-serif;
}
.title {
  font-size: 2em;
  margin-bottom: 0;
}
.author {
  font-size: 1.5em;
  margin-top: 0;
  margin-bottom: 2em;
}
.chapter {
  margin-top: 2em;
}
.cover {
  text-align: center;
  margin: 0;
  padding: 0;
}
.cover img {
  max-width: 100%;
  max-height: 100%;
}
nav ol {
  list-style-type: none;
}
nav a {
  text-decoration: none;
  color: #0000EE;
}
`,
    )

    // Add cover image if available
    let coverImageFilename = ""
    if (formData.coverImage) {
      const coverImageBase64 = await imageToBase64(formData.coverImage)
      const imageType = formData.coverImage.type
      const imageExt = imageType.split("/")[1]
      coverImageFilename = `cover.${imageExt}`

      // Remove the data URL prefix to get just the base64 data
      const base64Data = coverImageBase64.split(",")[1]
      images?.file(coverImageFilename, base64Data, { base64: true })
    }

    // Create title page
    oebps?.file(
      "title.xhtml",
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${formData.title}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css" />
</head>
<body>
  ${coverImageFilename ? `<div class="cover"><img src="images/${coverImageFilename}" alt="Cover" /></div>` : ""}
  <h1 class="title">${formData.title}</h1>
  <h2 class="author">${formData.author}</h2>
</body>
</html>`,
    )

    // Create chapter files
    const chapterFiles = formData.chapters.map((chapter, index) => {
      const filename = `chapter${index + 1}.xhtml`
      oebps?.file(
        filename,
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${chapter.title}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css" />
</head>
<body>
  <h2 class="chapter">${chapter.title}</h2>
  <div>${chapter.content.replace(/\n/g, "<br/>")}</div>
</body>
</html>`,
      )
      return filename
    })

    // Create nav.xhtml (required for EPUB3)
    oebps?.file(
      "nav.xhtml",
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navigation</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="title.xhtml">Title Page</a></li>
      ${formData.chapters
        .map((chapter, index) => `<li><a href="chapter${index + 1}.xhtml">${chapter.title}</a></li>`)
        .join("\n      ")}
    </ol>
  </nav>
</body>
</html>`,
    )

    // Create content.opf file
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookID">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookID">urn:uuid:${bookUUID}</dc:identifier>
    <dc:title>${formData.title}</dc:title>
    <dc:creator>${formData.author}</dc:creator>
    <dc:language>${formData.language}</dc:language>
    <dc:date>${formData.date}</dc:date>
    <dc:description>${formData.description}</dc:description>
    ${formData.isbn ? `<dc:identifier id="ISBN">${formData.isbn}</dc:identifier>` : ""}
    <dc:subject>${formData.genre}</dc:subject>
    <meta property="dcterms:modified">${new Date().toISOString().split(".")[0]}Z</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="stylesheet" href="stylesheet.css" media-type="text/css" />
    <item id="title" href="title.xhtml" media-type="application/xhtml+xml" />
    ${chapterFiles
      .map((file, index) => `<item id="chapter${index + 1}" href="${file}" media-type="application/xhtml+xml" />`)
      .join("\n    ")}
    ${coverImageFilename ? `<item id="cover-image" href="images/${coverImageFilename}" media-type="${formData.coverImage?.type}" properties="cover-image" />` : ""}
  </manifest>
  <spine toc="ncx">
    <itemref idref="title" />
    ${chapterFiles.map((_, index) => `<itemref idref="chapter${index + 1}" />`).join("\n    ")}
    <itemref idref="nav" />
  </spine>
  <guide>
    <reference type="cover" title="Cover" href="title.xhtml" />
    <reference type="toc" title="Table of Contents" href="nav.xhtml" />
  </guide>
</package>`

    oebps?.file("content.opf", contentOpf)

    // Create toc.ncx file (using the same UUID as in content.opf)
    const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${bookUUID}" />
    <meta name="dtb:depth" content="1" />
    <meta name="dtb:totalPageCount" content="0" />
    <meta name="dtb:maxPageNumber" content="0" />
  </head>
  <docTitle>
    <text>${formData.title}</text>
  </docTitle>
  <docAuthor>
    <text>${formData.author}</text>
  </docAuthor>
  <navMap>
    <navPoint id="navpoint-1" playOrder="1">
      <navLabel>
        <text>Title Page</text>
      </navLabel>
      <content src="title.xhtml" />
    </navPoint>
    ${formData.chapters
      .map(
        (chapter, index) =>
          `<navPoint id="navpoint-${index + 2}" playOrder="${index + 2}">
      <navLabel>
        <text>${chapter.title}</text>
      </navLabel>
      <content src="chapter${index + 1}.xhtml" />
    </navPoint>`,
      )
      .join("\n    ")}
  </navMap>
</ncx>`

    oebps?.file("toc.ncx", tocNcx)

    // Generate the ePub file
    const epubBlob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" })

    // Create a sanitized filename
    const filename = sanitizeFilename(formData.title) + ".epub"

    // Use our custom download function
    downloadBlob(epubBlob, filename)
  } catch (error) {
    console.error("Error generating EPUB:", error)
    throw error
  }
}

export async function generateAzw3(formData: FormData): Promise<void> {
  // For AZW3 (Kindle) format, we would typically need a server-side conversion
  // from EPUB to AZW3 using a tool like Calibre's ebook-convert
  // For now, we'll just alert the user that this feature is not available
  alert(
    "AZW3 (Kindle) export requires server-side processing and is not available in this demo. Please use the EPUB format instead.",
  )
}

