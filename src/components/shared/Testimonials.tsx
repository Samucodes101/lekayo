import Image from "next/image"
import { Star } from "lucide-react"
import { Testimonial } from "@prisma/client"

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  if (!testimonials.length) return null

  return (
    <section className="container mx-auto py-16 bg-gray-50 rounded-xl my-8">
      <h2 className="text-3xl font-serif text-center mb-12">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 italic">“{t.review}”</p>
            <div className="flex items-center gap-3 mt-4">
              {t.photo && (
                <Image src={t.photo} alt={t.customerName} width={40} height={40} className="rounded-full" />
              )}
              <span className="font-semibold">{t.customerName}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}