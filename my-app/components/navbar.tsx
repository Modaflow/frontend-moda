"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/integrations">
          <h1 className="font-serif text-3xl font-medium text-black">Moda</h1>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/integrations">
            <span
              className={`text-base font-medium transition-colors font-serif ${
                pathname === "/integrations" ? "text-black" : "text-black/60 hover:text-black"
              }`}
            >
              Integrations
            </span>
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Profile menu">
              <User className="h-5 w-5 text-black" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full pt-2">
                <div className="w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden">
                  <Link href="/profile">
                    <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-black">
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
