import { Paystack } from 'paystack-sdk'

export const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!)

export async function initializePayment(email: string, amount: number, metadata: any) {
  const response = await paystack.transaction.initialize({
    email,
    amount: amount * 100, // in kobo
    metadata,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
  })
  return response.data
}

export async function verifyPayment(reference: string) {
  const response = await paystack.transaction.verify({ reference })
  return response.data
}