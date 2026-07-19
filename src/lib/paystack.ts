import { Paystack } from "paystack-sdk"

export const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!)

export async function initializePayment(
  email: string,
  amount: number,
  metadata: any
): Promise<{ authorization_url: string; reference: string } | null> {
  try {
    const response = await paystack.transaction.initialize({
      email,
      amount: String(amount * 100), // SDK types expect amount as a string
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    })
    return response.data
  } catch (error) {
    console.error("Paystack init error:", error)
    return null
  }
}

export async function verifyPayment(reference: string) {
  const response = await paystack.transaction.verify(reference)
  return response.data
}