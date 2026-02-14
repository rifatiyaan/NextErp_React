"use client"

import { useState, useRef, useEffect, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelProps {
    children: ReactNode
    defaultWidth?: number // in pixels
    minWidth?: number // in pixels
    maxWidth?: number // in pixels
    side?: "left" | "right"
    className?: string
    storageKey?: string // for persisting width in localStorage
}

export function ResizablePanel({
    children,
    defaultWidth = 384, // 24rem = 384px
    minWidth = 240, // 15rem = 240px
    maxWidth = 600, // 37.5rem = 600px
    side = "right",
    className,
    storageKey,
}: ResizablePanelProps) {
    const [width, setWidth] = useState(defaultWidth)
    const [isResizing, setIsResizing] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startWidth, setStartWidth] = useState(0)
    const panelRef = useRef<HTMLDivElement>(null)

    // Load from localStorage on mount
    useEffect(() => {
        if (storageKey && typeof window !== "undefined") {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const parsed = parseInt(saved, 10)
                if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
                    setWidth(parsed)
                }
            }
        }
    }, [storageKey, minWidth, maxWidth])

    // Save to localStorage when width changes
    useEffect(() => {
        if (storageKey && typeof window !== "undefined") {
            localStorage.setItem(storageKey, width.toString())
        }
    }, [width, storageKey])

    useEffect(() => {
        if (!isResizing) return

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = side === "right" 
                ? startX - e.clientX // For right side, dragging left increases width
                : e.clientX - startX // For left side, dragging right increases width
            
            const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
            setWidth(newWidth)
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
    }, [isResizing, startX, startWidth, minWidth, maxWidth, side])

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
        setStartX(e.clientX)
        setStartWidth(width)
    }

    return (
        <div
            ref={panelRef}
            className={cn("relative flex flex-col flex-shrink-0", className)}
            style={{ width: `${width}px` }}
        >
            {children}
            <div
                onMouseDown={handleMouseDown}
                className={cn(
                    "absolute top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/50 transition-colors z-20 group",
                    side === "right" ? "left-0" : "right-0",
                    "after:absolute after:top-0 after:h-full after:w-0.5 after:bg-border after:opacity-0 group-hover:opacity-100",
                    side === "right" ? "after:left-0" : "after:right-0",
                    isResizing && "bg-primary/50 after:opacity-100"
                )}
                style={{ touchAction: "none" }}
                aria-label="Resize panel"
                role="separator"
                aria-orientation="vertical"
            />
        </div>
    )
}

