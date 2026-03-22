"use client"

export interface ProductStatsProps {
    ordersDisplay: string
    stockDisplay: string
    revenueDisplay: string
}

export function ProductStats({ ordersDisplay, stockDisplay, revenueDisplay }: ProductStatsProps) {
    return (
        <div className="rounded-xl border border-border/40 bg-muted/20 px-3 py-3 sm:px-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <StatItem label="No. of orders" value={ordersDisplay} />
                <StatItem label="Available stock" value={stockDisplay} />
                <StatItem label="Total revenue" value={revenueDisplay} />
            </div>
        </div>
    )
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{value}</p>
        </div>
    )
}
