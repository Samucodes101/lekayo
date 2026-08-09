import { prisma } from "@/lib/db"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function GalleryPage() {
  const images = await prisma.homepageGalleryImage.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">Gallery</h1>
      {images.length === 0 ? (
        <p className="text-gray-500">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group overflow-hidden rounded-lg">
              <Image
                src={img.image}
                alt={img.altText || ""}
                width={400}
                height={400}
                className="object-cover aspect-square w-full transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                {img.link && (
                  <a
                    href={img.link}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium underline"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}