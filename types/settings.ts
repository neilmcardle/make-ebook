export interface ExportSettings {
  format: 'epub' | 'pdf' | 'markdown'
  includeCover: boolean
  includeTableOfContents: boolean
  defaultLanguage: string
  pageSize?: 'A4' | 'A5' | 'Letter' // Only for PDF
  marginSize?: 'small' | 'medium' | 'large' // Only for PDF
}

export interface DefaultMetadata {
  author: string
  language: string
  publisher?: string
  rights?: string
}

export interface UserSettings {
  export: ExportSettings
  defaultMetadata: DefaultMetadata
  theme: 'light' | 'dark' | 'system'
  autosaveInterval: number // in minutes
  lastModified: string
}