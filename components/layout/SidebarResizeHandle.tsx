"use client"

import { useState, useRef, useEffect } from "react"
import { useSidebarWidth } from "@/contexts/sidebar-width-context"
import { cn } from "@/lib/utils"

const MIN_WIDTH = 12 // rem
const MAX_WIDTH = 30 // rem

export function SidebarResizeHandle() {
    const { widthInRem, setWidthInRem } = useSidebarWidth()
    const [isResizing, setIsResizing] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startWidth, setStartWidth] = useState(0)
    const handleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isResizing) return

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX
            // Convert pixels to rem (assuming 16px = 1rem)
            const deltaRem = deltaX / 16
            const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + deltaRem))
            setWidthInRem(newWidth)
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = ""
            document.body.style.userSelect = ""
        }
    }, [isResizing, startX, startWidth, setWidthInRem])

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
        setStartX(e.clientX)
        setStartWidth(widthInRem)
    }

    return (
        <div
            ref={handleRef}
            onMouseDown={handleMouseDown}
            className={cn(
                "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/50 transition-colors z-20 group",
                "after:absolute after:right-0 after:top-0 after:h-full after:w-0.5 after:bg-border after:opacity-0 group-hover:opacity-100",
                isResizing && "bg-primary/50 after:opacity-100"
            )}
            style={{ touchAction: "none" }}
            aria-label="Resize sidebar"
            role="separator"
            aria-orientation="vertical"
        />
    )
}

