import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"

export const DATA_TAGS = {
  brands: "brands",
  categories: "categories",
  subcategories: "subcategories",
  colors: "colors",
  sizes: "sizes",
  homepageCms: "homepage-cms",
  globalCms: "global-cms",
  marketing: "marketing",
} as const

export const getBrands = unstable_cache(
  async () => prisma.brand.findMany({ orderBy: { name: "asc" } }),
  [DATA_TAGS.brands],
  { tags: [DATA_TAGS.brands] }
)

export const getCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: "asc" },
    }),
  [DATA_TAGS.categories],
  { tags: [DATA_TAGS.categories, DATA_TAGS.subcategories] }
)

const getCategoryByIdCached = unstable_cache(
  async (categoryId: string) =>
    prisma.category.findUnique({
      where: { id: categoryId },
      include: { subcategories: true },
    }),
  [DATA_TAGS.categories],
  { tags: [DATA_TAGS.categories, DATA_TAGS.subcategories] }
)

export const getCategoryById = (categoryId: string) => getCategoryByIdCached(categoryId)

const getSubcategoriesByCategoryCached = unstable_cache(
  async (categoryId: string) =>
    prisma.subcategory.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
    }),
  [DATA_TAGS.subcategories],
  { tags: [DATA_TAGS.subcategories, DATA_TAGS.categories] }
)

export const getSubcategoriesByCategory = (categoryId: string) =>
  getSubcategoriesByCategoryCached(categoryId)

export const getColors = unstable_cache(
  async () => prisma.color.findMany({ orderBy: { name: "asc" } }),
  [DATA_TAGS.colors],
  { tags: [DATA_TAGS.colors] }
)

export const getSizes = unstable_cache(
  async () => prisma.sizeSystem.findMany({ orderBy: { name: "asc" } }),
  [DATA_TAGS.sizes],
  { tags: [DATA_TAGS.sizes] }
)
