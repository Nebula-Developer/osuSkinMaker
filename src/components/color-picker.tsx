import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useThrottledCallback } from "use-debounce"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(color)
  const inputRef = useRef<HTMLInputElement>(null)

  // Throttle onChange calls to fire every 300ms max
  const throttledOnChange = useThrottledCallback((newColor: string) => {
    onChange(newColor)
  }, 50)

  useEffect(() => {
    setInputValue(color)
  }, [color])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputValue(newColor)
    throttledOnChange(newColor)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal h-10"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border" style={{ backgroundColor: color }} />
            <span>{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <div className="mb-3 h-10 w-full rounded-md border" style={{ backgroundColor: inputValue }} />
            <div className="grid gap-2">
              <div className="grid grid-cols-3 gap-2">
                {["#ff5555", "#5555ff", "#55ff55", "#ffaa00", "#aa55ff", "#ffffff"].map((presetColor) => (
                  <div
                    key={presetColor}
                    className={cn(
                      "h-6 w-full cursor-pointer rounded-md border",
                      color === presetColor && "ring-2 ring-ring ring-offset-1"
                    )}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => {
                      setInputValue(presetColor)
                      onChange(presetColor) // immediate update for presets
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color-input">Color</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="color-input"
                type="color"
                value={inputValue}
                onChange={handleInputChange}
                className="w-10 p-1 cursor-pointer"
              />
              <Input
                id="color-text"
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value
                  setInputValue(val)
                  if (/^#[0-9A-F]{6}$/i.test(val)) {
                    throttledOnChange(val)
                  }
                }}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
