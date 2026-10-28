"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"

const POSTER = "/hero/hero-poster.jpg"

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)

  // The poster paints instantly (LCP); the video is attached only after mount so it
  // never competes with first paint. Mobile gets a lighter 540p encode, and
  // reduced-motion / data-saver users keep the still poster.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const saveData = (navigator as any).connection?.saveData === true
    if (reduceMotion || saveData) return

    const isMobile = window.matchMedia("(max-width: 768px)").matches
    const sources = isMobile
      ? [{ src: "/hero/hero-540.mp4", type: "video/mp4" }]
      : [
          { src: "/hero/hero-1080.webm", type: "video/webm" },
          { src: "/hero/hero-1080.mp4", type: "video/mp4" },
        ]

    for (const { src, type } of sources) {
      const source = document.createElement("source")
      source.src = src
      source.type = type
      video.appendChild(source)
    }
    video.load()
    video.play().catch(() => setPaused(true))
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-neutral-950">
      <Image
        src={POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        aria-hidden="true"
        onPlaying={() => setReady(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out",
          ready ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Grade the footage so it reads as a backdrop, not raw video:
          desaturating tint, fine dot texture, vignette, and a bottom fade for the copy */}
      <div className="absolute inset-0 bg-neutral-950/45 mix-blend-multiply" />
      <div className="absolute inset-0 backdrop-saturate-[0.65]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:3px_3px]" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/55 via-transparent to-transparent md:block" />

      <div className="relative z-10 flex h-full w-full flex-col justify-end px-6 pb-14 sm:px-12 sm:pb-20 lg:px-20 lg:pb-24">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 animate-[fadeUp_0.8s_ease-out]">
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">Shop Lekayo</span>
          </div>

          <h1 className="text-[2.75rem] font-semibold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl animate-[fadeUp_0.8s_ease-out_0.1s_backwards]">
            Timeless pieces,
            <br />
            <span className="font-light text-white/60">made for you.</span>
          </h1>

          <p className="mt-6 max-w-md text-base font-light text-white/75 sm:text-lg animate-[fadeUp_0.8s_ease-out_0.2s_backwards]">
            Curated fits and accessories from the brands you love — delivered across Nigeria.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 animate-[fadeUp_0.8s_ease-out_0.3s_backwards]">
            <Link
              href="/shop"
              className="group/cta inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 hover:shadow-[0_0_40px_-6px_rgba(255,255,255,0.5)]"
            >
              Shop Now
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-white backdrop-blur-md transition-colors hover:border-white/60 hover:bg-white/10"
            >
              Explore Brands
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={paused ? "Play background video" : "Pause background video"}
        className={cn(
          "absolute bottom-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-opacity hover:bg-black/50 sm:bottom-8 sm:right-10",
          ready || paused ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>

      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
        <div className="relative h-10 w-px overflow-hidden bg-white/20">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white animate-[scrollCue_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  )
}
