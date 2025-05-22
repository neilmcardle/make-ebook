export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex items-center justify-between px-4">
        <p className="text-sm text-gray-500">
          © 2025 Make eBook. Created by {" "}
          <a 
            href="https://github.com/neilmcardle" 
            className="underline hover:text-gray-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            neilmcardle
          </a>
        </p>
      </div>
    </footer>
  )
}