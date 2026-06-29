import { prisma } from "@/lib/db"
import WholesaleForm from "@/components/forms/WholesaleForm"

export default async function WholesalePage() {
  const settings = await prisma.setting.findUnique({ where: { key: "wholesale" } })
  const content = settings?.value as any || {}

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-4">Wholesale Program</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.description || "<p>Partner with Lekayo to offer luxury fashion to your customers. Enjoy exclusive pricing, dedicated support, and early access to new collections.</p>" }} />
          {content.telegramLink && (
            <p className="mt-4">
              <a href={content.telegramLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Join our Telegram channel</a>
            </p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Apply Now</h2>
          <WholesaleForm />
        </div>
      </div>
    </div>
  )
}