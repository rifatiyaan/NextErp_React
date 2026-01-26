"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

interface LoaderProps extends ComponentProps<"div"> {
    size?: "sm" | "md" | "lg"
    text?: string
    fullScreen?: boolean
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
}

export function Loader({ 
    className, 
    size = "md", 
    text, 
    fullScreen = false,
    ...props 
}: LoaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3",
                fullScreen && "min-h-screen w-full",
                !fullScreen && "p-8",
                className
            )}
            {...props}
        >
            <Loader2 
                className={cn(
                    "animate-spin text-primary",
                    sizeClasses[size]
                )} 
            />
            {text && (
                <p className="text-sm font-medium text-muted-foreground">
                    {text}
                </p>
            )}
        </div>
    )
}

interface LoaderOverlayProps extends ComponentProps<"div"> {
    isLoading: boolean
    text?: string
    size?: "sm" | "md" | "lg"
}

export function LoaderOverlay({ 
    isLoading, 
    text, 
    size = "md",
    className,
    children,
    ...props 
}: LoaderOverlayProps) {
    if (!isLoading) {
        return <>{children}</>
    }

    return (
        <div className={cn("relative", className)} {...props}>
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader size={size} text={text} />
            </div>
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
        </div>
    )
}

