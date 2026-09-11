"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"
import { getProductUrl } from "@/lib/utils"

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [results, setResults] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([])
      return
    }
    fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
      .then(res => res.json())
      .then(data => setResults(data))
  }, [debouncedSearch])

  useEffect(() => {
    if (!open) {
      setSearch("")
      setResults([])
    }
  }, [open])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search products, orders, customers..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Products">
          {results.map((product) => (
            <CommandItem key={product.id} onSelect={() => runCommand(() => router.push(getProductUrl(product.slug || product.name)))}>
              {product.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}