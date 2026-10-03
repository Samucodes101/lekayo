import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductList from "@/components/admin/ProductList"
import { ProductFilters } from "@/components/admin/ProductFilters"
import { queryProducts, PRODUCTS_PAGE_SIZE } from "@/lib/productAdminQueries"

type SP = Record<string, string | string[] | undefined>

export default async function CSProductsPage({
  searchParams,
}: {
  searchParams: Promise<SP> | SP
}) {
  const sp = await searchParams
  const { stats, brands, categories, rows, page, totalPages, filteredCount, pageHref } =
    await queryProducts(sp)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Products</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold">{s.value.toLocaleString("en-NG")}</p>
          </div>
        ))}
      </div>

      <ProductFilters brands={brands} categories={categories} />

      <ProductList rows={rows} readOnly />

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {filteredCount === 0
            ? "No products match these filters"
            : `Showing ${(page - 1) * PRODUCTS_PAGE_SIZE + 1}–${Math.min(page * PRODUCTS_PAGE_SIZE, filteredCount)} of ${filteredCount.toLocaleString("en-NG")}`}
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={pageHref(page - 1)}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              Previous
            </Link>
          </Button>
          <span className="px-2">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link
              href={pageHref(page + 1)}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}