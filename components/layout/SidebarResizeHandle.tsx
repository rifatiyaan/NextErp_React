"use client"

import { useEffect, useRef, useState } from "react"

import {
    NAV_RAIL_COLLAPSED_REM,
    NAV_RAIL_MAX_REM,
    useSidebarWidth,
} from "@/contexts/sidebar-width-context"
import { cn } from "@/lib/utils"

export function SidebarResizeHandle() {
    const { widthInRem, setWidthInRem } = useSidebarWidth()
    const [isResizing, setIsResizing] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startWidth, setStartWidth] = useState(0)
    const dragWidthRef = useRef(widthInRem)

    useEffect(() => {
        if (!isResizing) return

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX
            const deltaRem = deltaX / 16
            const newWidth = Math.max(
                NAV_RAIL_COLLAPSED_REM,
                Math.min(NAV_RAIL_MAX_REM, startWidth + deltaRem)
            )
            dragWidthRef.current = newWidth
            setWidthInRem(newWidth)
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            setWidthInRem(dragWidthRef.current, { snap: true })
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
        dragWidthRef.current = widthInRem
        setIsResizing(true)
        setStartX(e.clientX)
        setStartWidth(widthInRem)
    }

    return (
        <div
            onMouseDown={handleMouseDown}
            className={cn(
                "absolute right-0 top-0 z-20 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-primary/30 group",
                "hover:w-1.5",
                isResizing && "w-1.5 bg-primary/40"
            )}
            style={{ touchAction: "none" }}
            aria-label="Resize navigation rail"
            role="separator"
            aria-orientation="vertical"
        >
            <div className="pointer-events-none absolute right-0 top-1/2 h-12 w-0.5 -translate-y-1/2 rounded-full bg-border opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
    )
}
