"use client"

export interface ProductInfoRow {
    label: string
    value: string
}

export interface ProductInfoProps {
    rows: ProductInfoRow[]
    sectionIndex?: number
}

export function ProductInfo({ rows, sectionIndex = 4 }: ProductInfoProps) {
    if (!rows.length) return null

    return (
        <section className="space-y-2">
            <h3 className="text-xs font-medium text-foreground">
                <span className="text-muted-foreground">{sectionIndex}. </span>
                Product information
            </h3>
            <dl className="divide-y divide-border/30 overflow-hidden rounded-xl border border-border/40 bg-muted/15">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="grid grid-cols-1 gap-0.5 px-3 py-2.5 sm:grid-cols-[minmax(7rem,28%)_1fr] sm:items-baseline sm:gap-4 sm:px-4"
                    >
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {row.label}
                        </dt>
                        <dd className="text-xs font-medium tabular-nums text-foreground sm:text-sm">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}
