import { Button } from "@/components/ui/button"
import { Download, Save } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { HiMoon, HiSun } from 'react-icons/hi';
import { useThemeStore } from "@/store/themeStore";

export function Navbar() {
    const themeStore = useThemeStore();
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">osu!mania Skin Editor</h1>
      </div>

      <div className="flex flex-wrap justify-end items-center gap-2">
        <Select
          value={themeStore.theme}
          onValueChange={themeStore.setTheme}
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
