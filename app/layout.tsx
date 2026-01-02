import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Kids Naruto App',
  description: 'Kid-friendly Naruto characters and activities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-indigo-600 text-white p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">Kids Naruto</Link>
            <nav className="space-x-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/characters" className="hover:underline">Characters</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-4">{children}</main>
        <footer className="text-center text-sm text-slate-600 py-8">
          Made with ❤️ — demo app (use original/inspired characters to avoid copyright issues)
        </footer>
      </body>
    </html>
  )
}
