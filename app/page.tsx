import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Create Beautiful eBooks
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-[600px]">
        A simple and powerful tool to create, edit, and export your ebooks in multiple formats.
      </p>
      <Link href="/editor">
        <Button size="lg">
          Start Writing
        </Button>
      </Link>
    </div>
  )
}