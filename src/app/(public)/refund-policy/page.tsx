export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-serif mb-6">Refund & Returns Policy</h1>
      <div className="prose prose-gray">
        <p>Last updated: August 2026</p>
        <p>
          At Lekayo, customer satisfaction is our priority. If you are not
          completely satisfied with your purchase, we are here to help. Please
          review our Refund and Returns Policy below.
        </p>

        <h2>1. Return Eligibility</h2>
        <p>You may return items within 14 days of delivery, provided:</p>
        <ul>
          <li>
            The item is in its original, unused condition with all tags
            attached.
          </li>
          <li>The item is in its original packaging.</li>
          <li>
            You have proof of purchase (order confirmation email or receipt).
          </li>
        </ul>
        <p>
          <strong>Non-returnable items:</strong> For hygiene reasons, earrings,
          underwear, and swimwear cannot be returned unless faulty. Custom or
          personalized orders are also non-returnable.
        </p>

        <h2>2. Return Process</h2>
        <p>To initiate a return:</p>
        <ol>
          <li>
            Contact us at{" "}
            <a href="mailto:hello@lekayo.com" className="text-gray-900 underline">
              hello@lekayo.com
            </a>{" "}
            within 14 days of receiving your order. Include your order number
            and reason for return.
          </li>
          <li>
            Our team will review your request and provide return authorization
            and shipping instructions within 2 business days.
          </li>
          <li>
            Ship the item back using the provided instructions. Return shipping
            costs are the responsibility of the customer unless the item is
            faulty or incorrect.
          </li>
        </ol>

        <h2>3. Refunds</h2>
        <p>Once we receive and inspect your returned item:</p>
        <ul>
          <li>
            We will notify you of the approval or rejection of your refund
            within 3 business days.
          </li>
          <li>
            Approved refunds will be processed to your original payment method
            within 5-10 business days, depending on your bank or payment
            provider.
          </li>
          <li>
            Shipping costs are non-refundable. If you received free shipping,
            the standard shipping cost will be deducted from your refund.
          </li>
        </ul>

        <h2>4. Defective or Damaged Items</h2>
        <p>
          If you receive a defective or damaged item, please contact us within
          48 hours of delivery at hello@lekayo.com with photos of the damage. We
          will arrange a return at no cost to you and provide a full refund or
          replacement.
        </p>

        <h2>5. Wrong Item Received</h2>
        <p>
          If you receive the wrong item, please contact us within 48 hours of
          delivery. We will arrange a return and ship the correct item at no
          additional cost, or provide a full refund.
        </p>

        <h2>6. Exchanges</h2>
        <p>
          If you need a different size or color, please return the original item
          following our return process and place a new order. We recommend
          placing your new order promptly to ensure availability.
        </p>

        <h2>7. Order Cancellation</h2>
        <p>
          You may cancel your order before it has been shipped for a full
          refund. Once an order has been dispatched, our standard return policy
          applies. To cancel, contact us immediately at hello@lekayo.com with
          your order number.
        </p>

        <h2>8. Late or Missing Refunds</h2>
        <p>
          If you haven't received your refund within the stated timeframe:
        </p>
        <ol>
          <li>Check your bank account again.</li>
          <li>Contact your credit card company or bank.</li>
          <li>
            If you still have not received your refund, contact us at
            hello@lekayo.com and we will investigate.
          </li>
        </ol>

        <p>
          For questions about returns or refunds, contact us at
          hello@lekayo.com.
        </p>
      </div>
    </div>
  )
}