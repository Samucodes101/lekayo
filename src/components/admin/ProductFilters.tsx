"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  brands: { id: string; name: string }[]
  categories: { id: string; name: string; subcategories: { id: string; name: string }[] }[]
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"

export function ProductFilters({ brands, categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(sp.get("q") ?? "")
  const [min, setMin] = useState(sp.get("min") ?? "")
  const [max, setMax] = useState(sp.get("max") ?? "")

  const push = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    params.delete("page") // any filter change goes back to page 1
    const qs = params.toString()
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname))
  }

  // Debounce the free-text and price inputs so we don't query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      if (
        q !== (sp.get("q") ?? "") ||
        min !== (sp.get("min") ?? "") ||
        max !== (sp.get("max") ?? "")
      ) {
        push({ q: q || null, min: min || null, max: max || null })
      }
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, min, max])

  const selectedCategory = categories.find((c) => c.id === sp.get("category"))
  const hasFilters = Array.from(sp.keys()).some((k) => k !== "page")

  const reset = () => {
    setQ("")
    setMin("")
    setMax("")
    startTransition(() => router.push(pathname))
  }

  return (
    <div className={`space-y-3 rounded-lg border p-4 ${isPending ? "opacity-70" : ""}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search name, SKU, or brand…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className={selectClass}
          value={sp.get("brand") ?? ""}
          onChange={(e) => push({ brand: e.target.value || null })}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={sp.get("category") ?? ""}
          onChange={(e) => push({ category: e.target.value || null, subcategory: null })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={sp.get("subcategory") ?? ""}
          disabled={!selectedCategory}
          onChange={(e) => push({ subcategory: e.target.value || null })}
        >
          <option value="">
            {selectedCategory ? "All subcategories" : "Pick a category first"}
          </option>
          {selectedCategory?.subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={sp.get("status") ?? ""}
          onChange={(e) => push({ status: e.target.value || null })}
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          className={selectClass}
          value={sp.get("featured") ?? ""}
          onChange={(e) => push({ featured: e.target.value || null })}
        >
          <option value="">All products</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </select>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min ₦"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max ₦"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>

        <select
          className={selectClass}
          value={sp.get("sort") ?? "newest"}
          onChange={(e) => push({ sort: e.target.value === "newest" ? null : e.target.value })}
        >
          <option value="newest">Newest first</option>
          <option value="name">Name (A–Z)</option>
          <option value="name_desc">Name (Z–A)</option>
        </select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={reset}>
          Clear all filters
        </Button>
      )}
    </div>
  )
}
