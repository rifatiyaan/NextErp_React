"use client"

import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <FileQuestion className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
                <p className="text-lg text-muted-foreground">
                    Sorry, we couldn't find the page you're looking for.
                </p>
            </div>
            <Button asChild>
                <Link href="/">Go back home</Link>
            </Button>
        </div>
    )
}
