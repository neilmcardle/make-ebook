import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold">
            Make eBook
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/editor">
            <Button variant="ghost">Editor</Button>
          </Link>
          <Link href="/projects">
            <Button variant="ghost">My Projects</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}