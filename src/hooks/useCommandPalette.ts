import { useEffect } from "react"
import { useUIStore } from "@/stores/uiStore"

export function useCommandPalette() {
  const { setCommandPaletteOpen } = useUIStore()
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setCommandPaletteOpen])
}