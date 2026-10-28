import Link from "next/link"

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">Error 404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-black px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-neutral-800"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-gray-900 transition-colors hover:border-gray-900"
        >
          Home
        </Link>
      </div>
    </section>
  )
}
