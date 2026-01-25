"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps {
    value: number
    max?: number
    className?: string
}

export function Rating({ value, max = 5, className }: RatingProps) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {Array.from({ length: max }).map((_, index) => {
                const starValue = index + 1
                const isFilled = starValue <= Math.round(value)
                return (
                    <Star
                        key={index}
                        className={cn(
                            "h-4 w-4",
                            isFilled
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted-foreground"
                        )}
                    />
                )
            })}
            <span className="ml-1 text-sm text-muted-foreground">{value.toFixed(2)}</span>
        </div>
    )
}

