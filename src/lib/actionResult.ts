import { Prisma } from "@prisma/client"

// Server actions should RETURN errors rather than throw them: in production,
// Next.js replaces any thrown message with a generic "An error occurred in the
// Server Components render", so the admin never sees what actually went wrong.
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

/** Thrown inside an action for an error whose message is safe to show the user. */
export class UserFacingError extends Error {}

const FIELD_LABELS: Record<string, string> = {
  sku: "SKU",
  slug: "name",
  name: "name",
  email: "email",
}

/** Turns any error into a message the admin can act on, and logs the full error server-side. */
export function toActionError(error: unknown, context: string): { ok: false; error: string } {
  // Full details go to the server log (pm2 logs lekayo) for debugging
  console.error(`[${context}]`, error)

  if (error instanceof UserFacingError) return { ok: false, error: error.message }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const target = error.meta?.target
    const fields = (Array.isArray(target) ? target : typeof target === "string" ? [target] : []).map(String)
    switch (error.code) {
      case "P2002": {
        const field = fields.map((f) => FIELD_LABELS[f] ?? f).join(", ") || "value"
        if (fields.includes("sku")) {
          return { ok: false, error: "This SKU is already used by another product or variant. Use a different SKU." }
        }
        if (fields.includes("slug")) {
          return { ok: false, error: "A product with this name already exists. Use a different name." }
        }
        return { ok: false, error: `That ${field} is already in use.` }
      }
      case "P2003":
        return {
          ok: false,
          error: `A linked record no longer exists (${String(error.meta?.field_name ?? "reference")}). Reload the page and pick the brand, category, subcategory or colour again.`,
        }
      case "P2025":
        return { ok: false, error: "This record no longer exists. Reload the page and try again." }
      default:
        return { ok: false, error: `Database error ${error.code}: ${error.message.split("\n").pop()}` }
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    // Last line of Prisma's validation message names the bad field, e.g. "Unknown argument `foo`"
    const detail = error.message.trim().split("\n").pop()
    return { ok: false, error: `Invalid product data: ${detail}` }
  }

  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." }
}
