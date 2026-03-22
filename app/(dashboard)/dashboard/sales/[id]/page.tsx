"use client"

import { use, useEffect } from "react"
import Link from "next/link"

import { RecordPaymentForm } from "./_components/record-payment-form"
import { SaleDetailHeader } from "./_components/sale-detail-header"
import { SaleLineItemsTable } from "./_components/sale-line-items-table"
import { SalePaymentsList } from "./_components/sale-payments-list"
import { SaleSummary } from "./_components/sale-summary"
import { TableSkeleton } from "@/components/feedback/table-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSaleById } from "@/hooks/use-sales"

export default function DashboardSaleDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const { sale, loading, error, refetch } = useSaleById(id)

    useEffect(() => {
        document.title = sale ? `Sale ${sale.saleNumber}` : "Sale detail"
    }, [sale])

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-7 w-40 animate-pulse rounded bg-muted" />
                <TableSkeleton columns={5} rows={4} />
            </div>
        )
    }

    if (error || !sale) {
        return (
            <div className="space-y-3">
                <h1 className="text-xl font-semibold">Sale not found</h1>
                <p className="text-sm text-muted-foreground">
                    {error?.message ?? "This sale could not be loaded."}
                </p>
                <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href="/dashboard/sales">Back to sales</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                    <Link href="/dashboard/sales">← Sales</Link>
                </Button>
            </div>

            <SaleDetailHeader sale={sale} />

            <section className="space-y-2">
                <h2 className="text-sm font-semibold">Line items</h2>
                <SaleLineItemsTable items={sale.items} />
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="space-y-2">
                    <h2 className="text-sm font-semibold">Payments</h2>
                    <SalePaymentsList payments={sale.payments} />
                </section>
                <SaleSummary sale={sale} />
            </div>

            <Card>
                <CardHeader className="space-y-0 p-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Record payment</CardTitle>
                    <CardDescription className="text-xs">
                        Balance due:{" "}
                        <span className="font-medium text-foreground">
                            {sale.balanceDue.toFixed(2)}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <RecordPaymentForm
                        saleId={sale.id}
                        balanceDue={sale.balanceDue}
                        onRecorded={refetch}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
