"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRouter } from "next/navigation"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [search, setSearch] = useState("")
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
    if (search.length > 1) {
      fetch(`/api/search?q=${search}`).then(res => res.json()).then(setResults)
    }
  }, [search])

  const runCommand = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search products, orders, customers..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Products">
          {results.slice(0, 5).map((item) => (
            <CommandItem key={item.id} onSelect={() => runCommand(`/admin/products/${item.id}`)}>
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand("/admin/products/new")}>Add New Product</CommandItem>
          <CommandItem onSelect={() => runCommand("/admin/orders")}>View Orders</CommandItem>
          <CommandItem onSelect={() => runCommand("/admin/customers")}>View Customers</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}