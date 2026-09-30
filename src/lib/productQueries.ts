import { prisma } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

export async function resolveProductBySlug(paramsSlug: string) {
  let decodedSlug = paramsSlug
  try {
    decodedSlug = decodeURIComponent(paramsSlug)
  } catch {
    decodedSlug = paramsSlug
  }

  const requestedSlug = generateSlug(decodedSlug)

  const productKey = await prisma.product
    .findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ slug: paramsSlug }, { slug: decodedSlug }, { slug: requestedSlug }],
      },
      select: { id: true, slug: true, name: true },
    })
    .then(async (exactProduct) => {
      if (exactProduct) return exactProduct

      const publishedProducts = await prisma.product.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, slug: true, name: true },
      })

      return (
        publishedProducts.find(
          (candidate) =>
            generateSlug(candidate.slug) === requestedSlug ||
            generateSlug(candidate.name) === requestedSlug,
        ) ?? null
      )
    })

  if (!productKey) return null

  const product = await prisma.product.findUnique({
    where: { id: productKey.id },
    include: {
      brand: true,
      category: true,
      variants: {
        where: { isActive: true },
        include: { images: true, color: true },
      },
      flashSaleItems: {
        include: {
          flashSale: { select: { active: true, startsAt: true, endsAt: true } },
        },
      },
    },
  })

  if (!product) return null

  return {
    product,
    requestedSlug,
    canonicalProductSlug: generateSlug(product.slug),
  }
}
