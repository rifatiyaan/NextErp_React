"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ProductMediaProps {
    title: string
    imageUrls: string[]
}

export function ProductMedia({ title, imageUrls }: ProductMediaProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const urls = useMemo(() => imageUrls.filter(Boolean), [imageUrls])
    const safeIndex = Math.min(activeIndex, Math.max(0, urls.length - 1))
    const mainSrc = urls[safeIndex]

    return (
        <div className="mx-auto w-full max-w-[220px] space-y-3 sm:max-w-[240px] lg:max-w-none">
            <div
                className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-xl border border-border/40 bg-muted/20",
                    "shadow-sm"
                )}
            >
                {mainSrc ? (
                    <Image
                        src={mainSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/60" />
                    </div>
                )}
            </div>

            {urls.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2 lg:justify-start">
                    {urls.map((url, i) => {
                        const selected = i === safeIndex
                        return (
                            <button
                                key={`${url}-${i}`}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                className={cn(
                                    "relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-12 sm:w-12",
                                    selected
                                        ? "border-foreground/90 ring-2 ring-red-500/50 ring-offset-2 ring-offset-background"
                                        : "border-transparent opacity-80 hover:border-border hover:opacity-100"
                                )}
                                aria-label={`View image ${i + 1}`}
                                aria-pressed={selected}
                            >
                                <Image
                                    src={url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                {selected && (
                                    <span
                                        className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                                        aria-hidden
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
