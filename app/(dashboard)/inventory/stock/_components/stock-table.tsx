import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatQuantity } from "@/lib/formatters/number"
import type { StockTableRow } from "@/hooks/use-stock-page"
import { cn } from "@/lib/utils"

interface StockTableProps {
    rows: StockTableRow[]
    highlightLow: (productVariantId: number) => boolean
}

export function StockTable({ rows, highlightLow }: StockTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No stock rows
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => {
                            const warn = highlightLow(row.productVariantId)
                            return (
                                <TableRow
                                    key={row.productVariantId}
                                    className={cn(
                                        warn &&
                                            "bg-muted/60 border-l-2 border-l-primary"
                                    )}
                                >
                                    <TableCell className="font-medium">
                                        {row.productTitle}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {row.variantTitle || "—"}
                                    </TableCell>
                                    <TableCell className="font-mono text-[11px]">
                                        {row.variantSku || "—"}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-medium">
                                        {formatQuantity(row.quantity)}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
