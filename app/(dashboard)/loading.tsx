export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-12 w-12">
                    <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <div className="absolute h-12 w-12 animate-pulse rounded-full border-4 border-primary/30 opacity-20" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Loading content...
                </p>
            </div>
        </div>
    )
}
