"use client"
import Image from "next/image"

interface PreviewData {
  title: string
  author: string
  coverImage: string | null
  chapters: { title: string; content: string }[]
}

export const EbookPreview = ({ title, author, coverImage, chapters }: PreviewData) => {
  return (
    <div className="preview-dialog">
      <div className="preview-content">
        <div className="preview-cover">
          {coverImage && <Image src={coverImage || "/placeholder.svg"} alt="Cover preview" width={300} height={450} />}
        </div>
        <h2 className="preview-title">{title}</h2>
        <p className="preview-author">{author}</p>
        {chapters.map((chapter, index) => (
          <div key={index} className="preview-chapter">
            <h3 className="preview-chapter-title">{chapter.title}</h3>
            <p>{chapter.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

