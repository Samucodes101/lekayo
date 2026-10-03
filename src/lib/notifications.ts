import { sendEmail } from "@/lib/mail";
import { sendSms } from "@/lib/sms";
import { formatPrice } from "@/lib/utils";
import type { OrderWithDetails } from "@/lib/orders";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const appName = process.env.NEXT_PUBLIC_APP_NAME || "Lekayo";

function buildReceiptHtml(order: OrderWithDetails): string {
  const items = order.items
    .map((item) => {
      const name = item.variant?.product?.name ?? "Item";
      return (
        "<tr>" +
        `<td style="padding:8px;border-bottom:1px solid #eee;">${name}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.unitPrice)}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.totalPrice)}</td>` +
        "</tr>"
      );
    })
    .join("");

  const shipping = order.shippingAddress
    ? `<p style="margin:4px 0;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br/>${order.shippingAddress.addressLine1}<br/>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br/>${order.shippingAddress.country}</p>`
    : `<p style="margin:4px 0;">Pickup</p>`;

  return `<!doctype html>
<html><body style="font-family:Arial,sans-serif;color:#111;background:#f7f7f7;padding:24px;">
<div style="max-width:640px;margin:auto;background:#fff;border:1px solid #eee;border-radius:8px;padding:24px;">
  <h2 style="margin-top:0;">Thank you for your order</h2>
  <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
  <p>Total paid: <strong>${formatPrice(order.total)}</strong></p>
  <h3>Items</h3>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Item</th><th style="padding:8px;border-bottom:2px solid #ddd;">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Unit</th><th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Total</th></tr></thead>
    <tbody>${items}</tbody>
  </table>
  <p style="margin:16px 0 4px;">Subtotal: ${formatPrice(order.subtotal)}<br/>Delivery: ${formatPrice(order.shippingCost)}${order.discount > 0 ? `<br/>Discount: -${formatPrice(order.discount)}` : ""}<br/><strong>Total: ${formatPrice(order.total)}</strong></p>
  <h3>Delivery</h3>
  ${shipping}
  <p style="color:#666;">Track your order: <a href="${appUrl}/orders/track">${appUrl}/orders/track</a></p>
</div>
</body></html>`;
}

function buildSmsText(order: OrderWithDetails): string {
  const name = order.customerName?.split(" ")[0] || "customer";
  return `${appName}: Hi ${name}, order ${order.orderNumber} (${formatPrice(order.total)}) is confirmed. Track it at ${appUrl}/orders/track`;
}

export async function sendOrderConfirmation(order: OrderWithDetails): Promise<void> {
  const email = order.email?.trim();
  const phone = order.customerPhone?.trim() || order.shippingAddress?.phone?.trim();

  if (email) {
    try {
      await sendEmail(email, `${appName} - Order ${order.orderNumber} confirmed`, buildReceiptHtml(order));
    } catch (error) {
      console.error("[notify] email failed", error);
    }
  }

  if (phone) {
    await sendSms(phone, buildSmsText(order));
  }
}