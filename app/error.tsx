"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Something went wrong!</h1>
                <p className="text-lg text-muted-foreground">
                    An unexpected error occurred. Please try again.
                </p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Go Home
                </Button>
            </div>
        </div>
    )
}
