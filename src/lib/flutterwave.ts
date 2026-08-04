export async function initializeFlutterwavePayment(
  email: string,
  amount: number,
  metadata: any
): Promise<{ authorization_url: string; reference: string } | null> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
  if (!secretKey) {
    console.error("Flutterwave secret key is not configured")
    return null
  }

  const payload = {
    tx_ref: `order-${metadata.orderId}-${Date.now()}`,
    amount: String(amount),
    currency: process.env.FLUTTERWAVE_CURRENCY || "NGN",
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    customer: {
      email,
      phonenumber: metadata.phone,
      name: `${metadata.firstName} ${metadata.lastName}`,
    },
    customizations: {
      title: process.env.NEXT_PUBLIC_APP_NAME || "Lekayo Store",
      description: "Complete your order payment",
    },
    meta: {
      orderId: metadata.orderId,
      paymentGateway: "FLUTTERWAVE",
    },
  }

  try {
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Flutterwave init error:", response.status, errorBody)
      return null
    }

    const { data } = await response.json()
    if (!data?.link || !data?.flw_ref) {
      console.error("Unexpected Flutterwave response", data)
      return null
    }

    return {
      authorization_url: data.link,
      reference: data.flw_ref,
    }
  } catch (error) {
    console.error("Flutterwave init error:", error)
    return null
  }
}
