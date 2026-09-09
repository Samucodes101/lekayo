"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RotateCcw, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatPrice } from "@/lib/utils"

interface FilterSidebarProps {
  brands?: Array<{ id: string; name: string }>
  categories?: Array<{ id: string; name: string }>
  showBrands?: boolean
  showCategories?: boolean
  maxPrice?: number
}

export default function FilterSidebar({
  brands = [],
  categories = [],
  showBrands = true,
  showCategories = true,
  maxPrice = 500000,
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice])

  useEffect(() => {
    const min = Number(searchParams.get("minPrice"))
    const max = Number(searchParams.get("maxPrice"))
    setSelectedBrands(searchParams.get("brand")?.split(",") ?? [])
    setSelectedCategories(searchParams.get("category")?.split(",") ?? [])
    setPriceRange([
      Number.isFinite(min) && min >= 0 ? min : 0,
      Number.isFinite(max) && max > 0 ? Math.min(max, maxPrice) : maxPrice,
    ])
  }, [searchParams, maxPrice])

  const updateFilters = (nextBrands: string[], nextCategories: string[], nextPrice: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (showBrands && nextBrands.length > 0) params.set("brand", nextBrands.join(","))
    else if (showBrands) params.delete("brand")
    if (showCategories && nextCategories.length > 0) params.set("category", nextCategories.join(","))
    else if (showCategories) params.delete("category")
    if (nextPrice[0] > 0) params.set("minPrice", String(nextPrice[0]))
    else params.delete("minPrice")
    if (nextPrice[1] < maxPrice) params.set("maxPrice", String(nextPrice[1]))
    else params.delete("maxPrice")
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const updated = checked ? [...selectedBrands, brandId] : selectedBrands.filter((id) => id !== brandId)
    setSelectedBrands(updated)
    updateFilters(updated, selectedCategories, priceRange)
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updated = checked ? [...selectedCategories, categoryId] : selectedCategories.filter((id) => id !== categoryId)
    setSelectedCategories(updated)
    updateFilters(selectedBrands, updated, priceRange)
  }

  const handlePriceChange = (value: number[]) => {
    const updated: [number, number] = [value[0], value[1]]
    setPriceRange(updated)
    updateFilters(selectedBrands, selectedCategories, updated)
  }

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("brand")
    params.delete("category")
    params.delete("minPrice")
    params.delete("maxPrice")
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const activeFilterCount = selectedBrands.length + selectedCategories.length +
    (priceRange[0] > 0 ? 1 : 0) + (priceRange[1] < maxPrice ? 1 : 0)

  const filterControls = (
    <Accordion type="multiple" defaultValue={["brands", "categories", "price"]}>
      {showBrands && brands.length > 0 && (
        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              {brands.map((brand) => (
                <label key={brand.id} htmlFor={`brand-${brand.id}`} className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded py-2 text-sm hover:bg-gray-50">
                  <Checkbox id={`brand-${brand.id}`} checked={selectedBrands.includes(brand.id)} onCheckedChange={(checked) => handleBrandChange(brand.id, checked === true)} />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
      {showCategories && categories.length > 0 && (
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              {categories.map((category) => (
                <label key={category.id} htmlFor={`category-${category.id}`} className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded py-2 text-sm hover:bg-gray-50">
                  <Checkbox id={`category-${category.id}`} checked={selectedCategories.includes(category.id)} onCheckedChange={(checked) => handleCategoryChange(category.id, checked === true)} />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
      <AccordionItem value="price">
        <AccordionTrigger>Price range</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 px-1">
            <Slider min={0} max={maxPrice} step={100} value={priceRange} onValueChange={handlePriceChange} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  return (
    <>
      <aside className="hidden w-60 shrink-0 pr-4 md:block">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Filter by</h2>
          {activeFilterCount > 0 && <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs"><RotateCcw className="mr-1 h-3.5 w-3.5" />Clear</Button>}
        </div>
        {filterControls}
      </aside>
      <div className="mb-5 flex items-center justify-between md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><SlidersHorizontal className="mr-2 h-4 w-4" />Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogTitle>Filter products</DialogTitle>
            {filterControls}
            {activeFilterCount > 0 && <Button variant="outline" onClick={resetFilters}><RotateCcw className="mr-2 h-4 w-4" />Clear filters</Button>}
          </DialogContent>
        </Dialog>
        {activeFilterCount > 0 && <Button variant="ghost" size="sm" onClick={resetFilters}>Clear all</Button>}
      </div>
    </>
  )
}
