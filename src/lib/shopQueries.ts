import { prisma } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

/**
 * Shop URLs use normalised slugs (see getShopUrl), but stored slugs may be raw
 * admin input such as "Acid/Stone". Try an exact match first, then fall back to
 * comparing normalised slugs so legacy records still resolve.
 */
export async function resolveShopCategory(param: string) {
  const slug = safeDecode(param)
  const exact = await prisma.category.findUnique({
    where: { slug },
    include: { subcategories: true },
  })
  if (exact) return exact

  const target = generateSlug(slug)
  const all = await prisma.category.findMany({ include: { subcategories: true } })
  return all.find((c) => generateSlug(c.slug) === target) ?? null
}

export async function resolveShopSubcategory(categoryParam: string, subcategoryParam: string) {
  const category = await resolveShopCategory(categoryParam)
  if (!category) return null

  const slug = safeDecode(subcategoryParam)
  const target = generateSlug(slug)
  const match = category.subcategories.find((s) => s.slug === slug || generateSlug(s.slug) === target)
  if (!match) return null

  const { subcategories, ...categoryFields } = category
  return { ...match, category: categoryFields }
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
