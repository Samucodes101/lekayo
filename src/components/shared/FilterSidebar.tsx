"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FilterSidebarProps {
  brands: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
}

export default function FilterSidebar({ brands, categories }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const brandsParam = searchParams.get("brand")
    return brandsParam ? brandsParam.split(",") : []
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const catParam = searchParams.get("category")
    return catParam ? catParam.split(",") : []
  })
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])

  useEffect(() => {
    const min = searchParams.get("minPrice")
    const max = searchParams.get("maxPrice")
    if (min && max) {
      setPriceRange([Number(min), Number(max)])
    }
  }, [searchParams])

  const updateFilters = (brands: string[], categories: string[], price: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (brands.length > 0) params.set("brand", brands.join(","))
    else params.delete("brand")
    if (categories.length > 0) params.set("category", categories.join(","))
    else params.delete("category")
    params.set("minPrice", String(price[0]))
    params.set("maxPrice", String(price[1]))
    // Reset page to 1
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const updated = checked ? [...selectedBrands, brandId] : selectedBrands.filter(id => id !== brandId)
    setSelectedBrands(updated)
    updateFilters(updated, selectedCategories, priceRange)
  }

  const handleCategoryChange = (catId: string, checked: boolean) => {
    const updated = checked ? [...selectedCategories, catId] : selectedCategories.filter(id => id !== catId)
    setSelectedCategories(updated)
    updateFilters(selectedBrands, updated, priceRange)
  }

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]]
    setPriceRange(newRange)
    updateFilters(selectedBrands, selectedCategories, newRange)
  }

  return (
    <div className="w-64 pr-4">
      <Accordion type="multiple" defaultValue={["brands", "categories", "price"]}>
        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={(checked) => handleBrandChange(brand.id, checked === true)}
                  />
                  <Label htmlFor={`brand-${brand.id}`}>{brand.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={selectedCategories.includes(cat.id)}
                    onCheckedChange={(checked) => handleCategoryChange(cat.id, checked === true)}
                  />
                  <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={0}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}