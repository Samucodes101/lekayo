export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-serif mb-6">Shipping Policy</h1>
      <div className="prose prose-gray">
        <p>Last updated: August 2026</p>
        <p>
          At Lekayo, we are committed to delivering your luxury items safely and
          promptly. This Shipping Policy outlines our shipping practices,
          timelines, and related terms.
        </p>

        <h2>1. Processing Time</h2>
        <p>
          All orders are processed within 1-3 business days of payment
          confirmation. Orders placed on weekends or public holidays will be
          processed on the next business day. You will receive a confirmation
          email once your order has been shipped.
        </p>

        <h2>2. Shipping Methods & Delivery Times</h2>
        <p>We offer the following shipping options:</p>
        <ul>
          <li>
            <strong>Standard Shipping:</strong> 5-10 business days within
            Nigeria. Free on orders over ₦100,000.
          </li>
          <li>
            <strong>Express Shipping:</strong> 2-4 business days within major
            cities in Nigeria. Flat rate of ₦5,000.
          </li>
          <li>
            <strong>International Shipping:</strong> 7-21 business days
            depending on destination. Rates calculated at checkout based on
            weight and location.
          </li>
        </ul>
        <p>
          Delivery times are estimates and may vary due to factors beyond our
          control, including customs clearance for international orders.
        </p>

        <h2>3. Shipping Rates</h2>
        <p>
          Shipping rates are calculated based on the weight of your order,
          shipping method selected, and delivery destination. The exact shipping
          cost will be displayed at checkout before you complete your purchase.
        </p>

        <h2>4. Order Tracking</h2>
        <p>
          Once your order is shipped, you will receive a tracking number via
          email. You can track your order using our{" "}
          <a href="/orders/track" className="text-gray-900 underline">
            Order Tracking
          </a>{" "}
          page or through the carrier's website.
        </p>

        <h2>5. International Shipping</h2>
        <p>
          International orders may be subject to customs duties, taxes, and
          import fees levied by the destination country. These charges are the
          responsibility of the recipient. Lekayo is not responsible for delays
          caused by customs clearance processes.
        </p>

        <h2>6. Shipping Restrictions</h2>
        <p>
          We currently ship to all states within Nigeria and select
          international destinations. If your country is not available at
          checkout, please contact us at hello@lekayo.com for assistance.
        </p>

        <h2>7. Lost or Damaged Packages</h2>
        <p>
          If your package is lost or arrives damaged, please contact us within
          48 hours of the expected delivery date or receipt of the damaged
          package. We will work with the carrier to resolve the issue and ensure
          you receive your order or a full refund.
        </p>

        <h2>8. Incorrect Shipping Address</h2>
        <p>
          Please ensure your shipping address is correct at checkout. Lekayo is
          not responsible for orders shipped to incorrectly provided addresses.
          If you notice an error, contact us immediately at hello@lekayo.com. We
          will do our best to update the address before the order is dispatched.
        </p>

        <p>
          For questions about shipping, contact us at hello@lekayo.com.
        </p>
      </div>
    </div>
  )
}