"use client"

import { useRef, useState } from "react"
import type React from "react"
import { generateEpub, generateAzw3 } from "@/lib/ebookGenerators"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { X, Info, Upload, BookOpen, Heart } from "lucide-react"
import { EbookPreview } from "./EbookPreview"
import RichTextEditor from "./RichTextEditor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SimpleRichTextEditor from "./SimpleRichTextEditor"

export interface FormData {
  title: string
  author: string
  isbn: string
  genre: string
  description: string
  date: string
  language: string
  chapters: Chapter[]
  coverImage: File | null
}

interface Chapter {
  title: string
  content: string
}

interface FormErrors {
  title?: string
  author?: string
  isbn?: string
  genre?: string
  description?: string
  date?: string
  language?: string
  chapters?: string[]
}

export default function EbookForm() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    description: "",
    date: "",
    language: "en",
    chapters: [{ title: "", content: "" }],
    coverImage: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{
    title: string
    author: string
    coverImage: string | null
    chapters: { title: string; content: string }[]
  }>({
    title: "",
    author: "",
    coverImage: null,
    chapters: [],
  })
  const [activeTab, setActiveTab] = useState("edit")
  const [useSimpleEditor, setUseSimpleEditor] = useState(true)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (formData.title.trim() === "") {
      newErrors.title = "Title is required"
    }

    if (formData.author.trim() === "") {
      newErrors.author = "Author is required"
    }

    if (formData.isbn && !/^(?:\d{10}|\d{13})$/.test(formData.isbn)) {
      newErrors.isbn = "ISBN must be 10 or 13 digits"
    }

    if (formData.genre === "") {
      newErrors.genre = "Genre is required"
    }

    if (formData.description.trim() === "") {
      newErrors.description = "Description is required"
    }

    if (formData.date === "") {
      newErrors.date = "Publishing date is required"
    }

    if (formData.language.trim() === "") {
      newErrors.language = "Language is required"
    } else if (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(formData.language)) {
      newErrors.language = "Invalid language code (e.g., 'en' or 'en-US')"
    }

    const chapterErrors: string[] = []
    formData.chapters.forEach((chapter, index) => {
      if (chapter.title.trim() === "") {
        chapterErrors[index] = "Chapter title is required"
      }
      if (chapter.content.trim() === "") {
        chapterErrors[index] = (chapterErrors[index] || "") + " Chapter content is required"
      }
    })
    if (chapterErrors.length > 0) {
      newErrors.chapters = chapterErrors
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }))
  }

  const handleChapterTitleChange = (index: number, value: string) => {
    const newChapters = [...formData.chapters]
    newChapters[index].title = value
    setFormData((prevState) => ({ ...prevState, chapters: newChapters }))
    setErrors((prevErrors) => {
      const newChapterErrors = [...(prevErrors.chapters || [])]
      newChapterErrors[index] = undefined
      return { ...prevErrors, chapters: newChapterErrors }
    })
  }

  const handleChapterContentChange = (index: number, content: string) => {
    const newChapters = [...formData.chapters]
    newChapters[index].content = content
    setFormData((prevState) => ({ ...prevState, chapters: newChapters }))
    setErrors((prevErrors) => {
      const newChapterErrors = [...(prevErrors.chapters || [])]
      newChapterErrors[index] = undefined
      return { ...prevErrors, chapters: newChapterErrors }
    })
  }

  const addChapter = () => {
    setFormData((prevState) => ({
      ...prevState,
      chapters: [...prevState.chapters, { title: "", content: "" }],
    }))
  }

  const removeChapter = (index: number) => {
    setFormData((prevState) => ({
      ...prevState,
      chapters: prevState.chapters.filter((_, i) => i !== index),
    }))
    setErrors((prevErrors) => {
      const newChapterErrors = [...(prevErrors.chapters || [])]
      newChapterErrors.splice(index, 1)
      return { ...prevErrors, chapters: newChapterErrors }
    })
  }

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prevState) => ({ ...prevState, coverImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCoverImage = () => {
    setFormData((prevState) => ({ ...prevState, coverImage: null }))
    setCoverImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExport = async (format: "epub" | "azw3") => {
    if (validateForm()) {
      try {
        if (format === "epub") {
          await generateEpub(formData)
        } else if (format === "azw3") {
          await generateAzw3(formData)
        }
        alert(`eBook generated successfully in ${format.toUpperCase()} format!`)
      } catch (error) {
        console.error(`Error generating ${format.toUpperCase()} eBook:`, error)
        alert(`An error occurred while generating the ${format.toUpperCase()} eBook. Please try again.`)
      }
    } else {
      alert("Please correct the errors in the form before exporting.")
    }
    setExportDialogOpen(false)
  }

  const handlePreview = () => {
    setPreviewData({
      title: formData.title,
      author: formData.author,
      coverImage: coverImagePreview,
      chapters: formData.chapters,
    })
    setActiveTab("preview")
  }

  const inputClasses =
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1"
  const errorClasses = "text-red-500 text-sm mt-1"

  return (
    <div className="pb-16">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create Your Ebook</h1>
        </div>

        <div>
          <Label htmlFor="title" className={labelClasses}>
            Book Title
          </Label>
          <Input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className={`${inputClasses} ${errors.title ? "border-red-500" : ""}`}
            placeholder="Enter the title of your book"
          />
          {errors.title && <p className={errorClasses}>{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="author" className={labelClasses}>
            Author
          </Label>
          <Input
            type="text"
            id="author"
            name="author"
            required
            value={formData.author}
            onChange={handleInputChange}
            className={`${inputClasses} ${errors.author ? "border-red-500" : ""}`}
            placeholder="Enter author name"
          />
          {errors.author && <p className={errorClasses}>{errors.author}</p>}
        </div>

        <div>
          <Label htmlFor="isbn" className={labelClasses}>
            ISBN (International Standard Book Number)
          </Label>
          <Input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleInputChange}
            className={`${inputClasses} ${errors.isbn ? "border-red-500" : ""}`}
            placeholder="Enter ISBN (optional)"
          />
          {errors.isbn && <p className={errorClasses}>{errors.isbn}</p>}
        </div>

        <div>
          <Label htmlFor="genre" className={labelClasses}>
            Genre
          </Label>
          <Select
            value={formData.genre}
            onValueChange={(value) =>
              handleInputChange({ target: { name: "genre", value } } as React.ChangeEvent<HTMLSelectElement>)
            }
          >
            <SelectTrigger className={`${inputClasses} ${errors.genre ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fiction">Fiction</SelectItem>
              <SelectItem value="non-fiction">Non-Fiction</SelectItem>
              <SelectItem value="mystery">Mystery</SelectItem>
              <SelectItem value="sci-fi">Science Fiction</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="romance">Romance</SelectItem>
              <SelectItem value="thriller">Thriller</SelectItem>
              <SelectItem value="horror">Horror</SelectItem>
              <SelectItem value="biography">Biography</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="self-help">Self-Help</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.genre && <p className={errorClasses}>{errors.genre}</p>}
        </div>

        <div>
          <Label htmlFor="description" className={labelClasses}>
            Book Description
          </Label>
          <Textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleInputChange}
            className={`${inputClasses} ${errors.description ? "border-red-500" : ""}`}
            placeholder="Write a brief description of your book"
          />
          {errors.description && <p className={errorClasses}>{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="date" className={labelClasses}>
              Publishing Date
            </Label>
            <Input
              type="date"
              id="date"
              name="date"
              required
              value={formData.date}
              onChange={handleInputChange}
              className={`${inputClasses} ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && <p className={errorClasses}>{errors.date}</p>}
          </div>

          <div>
            <Label htmlFor="language" className={labelClasses}>
              Language
            </Label>
            <Input
              type="text"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              required
              className={`${inputClasses} ${errors.language ? "border-red-500" : ""}`}
              placeholder="en"
            />
            {errors.language && <p className={errorClasses}>{errors.language}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="coverImage" className={labelClasses}>
            Cover Image
          </Label>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                accept="image/*"
                onChange={handleCoverImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                Upload Cover
              </Button>
              {coverImagePreview && (
                <div className="relative">
                  <Image
                    src={coverImagePreview || "/placeholder.svg"}
                    alt="Cover preview"
                    width={100}
                    height={150}
                    className="object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">Recommended: JPG or PNG, 1600×2400 pixels (4:6 ratio), max 2MB</div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Chapters</h2>
          {formData.chapters.map((chapter, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
              <Input
                type="text"
                value={chapter.title}
                onChange={(e) => handleChapterTitleChange(index, e.target.value)}
                placeholder={`Chapter ${index + 1} Title`}
                className={`w-full mb-2 p-2 border ${errors.chapters?.[index] ? "border-red-500" : "border-gray-300"} rounded`}
              />

              <div className="mt-4">
                <div className="flex items-center justify-center text-gray-500 text-sm mb-2">
                  <Info className="h-4 w-4 mr-1 text-gray-400" />
                  <span>eReader-compatible formatting</span>
                </div>

                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-2">
                    {useSimpleEditor ? (
                      <SimpleRichTextEditor
                        content={chapter.content}
                        onChange={(content) => handleChapterContentChange(index, content)}
                        placeholder={`Write your chapter content here...`}
                      />
                    ) : (
                      <RichTextEditor
                        content={chapter.content}
                        onChange={(content) => handleChapterContentChange(index, content)}
                        placeholder={`Write your chapter content here...`}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2 p-4 border rounded-md min-h-[200px] prose">
                    <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                  </TabsContent>
                </Tabs>
              </div>

              {errors.chapters?.[index] && <p className={errorClasses}>{errors.chapters[index]}</p>}
              {formData.chapters.length > 1 && (
                <Button type="button" onClick={() => removeChapter(index)} variant="destructive" className="mt-2">
                  Remove Chapter
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={addChapter} variant="secondary" className="mt-2">
            Add Chapter
          </Button>
        </div>

        <div className="flex justify-between items-center mt-10 mb-16">
          <Button type="button" onClick={handlePreview} variant="outline">
            Update Preview
          </Button>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <EbookPreview {...previewData} />
            </TabsContent>
          </Tabs>

          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button">Export eBook</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose Export Format</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button onClick={() => handleExport("epub")}>Export as EPUB</Button>
                <Button onClick={() => handleExport("azw3")}>Export as AZW3 (Kindle)</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </form>

      <footer className="mt-20 py-6 border-t border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 mr-2 text-primary" />
              <span className="text-lg font-semibold">eBook Creator</span>
            </div>
            <div className="text-sm text-gray-500">Create beautiful eBooks compatible with all major eReaders</div>
            <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500" />
              <span>for book lovers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

