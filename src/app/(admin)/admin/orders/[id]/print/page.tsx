// src/app/(admin)/admin/orders/[id]/print/page.tsx
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Receipt from "@/components/shared/Receipt"
import PrintButton from "@/components/shared/PrintButton"

export default async function AdminPrintReceiptPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      shippingAddress: true,
    },
  })
  if (!order) notFound()

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Receipt order={order} />
      <div className="text-center mt-4">
        <PrintButton />
      </div>
    </div>
  )
}