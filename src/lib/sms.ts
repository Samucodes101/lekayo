/**
 * Minimal SMS sender (Termii). Non-fatal: if unconfigured we log and return
 * false rather than throwing, so a missing SMS key can never break a webhook.
 */
function normalizePhone(phone: string | null | undefined): string {
  let p = (phone || "").replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("234")) return p;
  if (p.startsWith("0")) return "234" + p.slice(1);
  return p;
}

export async function sendSms(to: string | null | undefined, message: string): Promise<boolean> {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || "Lekayo";
  const phone = normalizePhone(to);

  if (!apiKey || !phone || phone.length < 10) {
    console.warn("[sms] skipped - TERMII_API_KEY or destination phone missing");
    return false;
  }

  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: phone,
        from: senderId,
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: apiKey,
      }),
    });

    if (!res.ok) {
      console.error("[sms] Termii error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[sms] failed", error);
    return false;
  }
}