import { Button } from "@/components/ui/button"
import { Download, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { HiMoon, HiSun } from 'react-icons/hi';

export function Navbar() {
  const [theme, setTheme] = useState("dark")
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    document.body.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.body.classList.toggle("dark", savedTheme === "dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      document.body.classList.toggle("dark", prefersDark)
    }
  }, [])

  return (
    <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">osu!mania Skin Editor</h1>
      </div>

      <div className="flex flex-wrap justify-end items-center gap-2">
        <Select
          value={theme}
          onValueChange={handleThemeChange}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">
              <div className="flex items-center gap-2">
                <HiMoon className="h-4 w-4" />
                Dark
              </div>
            </SelectItem>
            <SelectItem value="light">
              <div className="flex items-center gap-2">
                <HiSun className="h-4 w-4" />
                Light
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </header>
  )
}
