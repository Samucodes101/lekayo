import { formatPrice } from "@/lib/utils"

interface OrderSummaryProps {
  /** Sum of line prices, already discounted */
  subtotal: number
  /** Flash-sale savings already included in `subtotal` (shown for information) */
  discount: number
  shipping: number
  total: number
}

export default function OrderSummary({ subtotal, discount, shipping, total }: OrderSummaryProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between">
        <span>Subtotal</span>
        {/* Show the pre-sale amount so Subtotal − Discount = what the customer pays */}
        <span>{formatPrice(subtotal + discount)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Shipping</span>
        <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
      </div>
      <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  )
}