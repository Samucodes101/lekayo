/**
 * Email delivery via the Brevo (Sendinblue) transactional API.
 * Non-fatal: if BREVO_API_KEY is missing we log and skip, so a config gap can
 * never break the webhook or contact flow.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !to) {
    console.warn("[mail] skipped - BREVO_API_KEY or recipient missing");
    return false;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_FROM_NAME || "Lekayo",
          email: process.env.BREVO_FROM_EMAIL || "hello@lekayo.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      console.error("[mail] Brevo error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[mail] failed", error);
    return false;
  }
}