"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FilterSidebarProps {
  brands: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
  onFilterChange: (filters: any) => void
}

export default function FilterSidebar({ brands, categories, onFilterChange }: FilterSidebarProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 5000])

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const updated = checked ? [...selectedBrands, brandId] : selectedBrands.filter(id => id !== brandId)
    setSelectedBrands(updated)
    onFilterChange({ brands: updated, categories: selectedCategories, priceRange })
  }

  const handleCategoryChange = (catId: string, checked: boolean) => {
    const updated = checked ? [...selectedCategories, catId] : selectedCategories.filter(id => id !== catId)
    setSelectedCategories(updated)
    onFilterChange({ brands: selectedBrands, categories: updated, priceRange })
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onFilterChange({ brands: selectedBrands, categories: selectedCategories, priceRange: value })
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