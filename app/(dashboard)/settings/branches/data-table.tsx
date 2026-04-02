"use client"

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    type Table as TanStackTable,
} from "@tanstack/react-table"
import { useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount: number
    pageIndex: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    onTableReady?: (table: TanStackTable<TData>) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pageIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onTableReady,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: { pagination: { pageIndex: pageIndex - 1, pageSize }, rowSelection: {} },
        enableRowSelection: true,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    useEffect(() => {
        onTableReady?.(table)
    }, [table, onTableReady])

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        if (pageCount <= 5) {
            for (let i = 1; i <= pageCount; i++) pages.push(i)
        } else {
            const start = Math.max(1, pageIndex - 2)
            const end   = Math.min(pageCount, pageIndex + 2)
            if (start > 1) { pages.push(1); if (start > 2) pages.push("…-start") }
            for (let i = start; i <= end; i++) pages.push(i)
            if (end < pageCount) { if (end < pageCount - 1) pages.push("…-end"); pages.push(pageCount) }
        }
        return pages
    }

    return (
        <div className="space-y-3">
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
                                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-16 text-center text-xs text-muted-foreground">
                                    No branches found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="text-[11px] text-muted-foreground">Rows per page</p>
                    <Select value={pageSize.toString()} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1) }}>
                        <SelectTrigger className="h-7 w-[64px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 50].map((s) => (
                                <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious size="icon" onClick={() => pageIndex > 1 && onPageChange(pageIndex - 1)}
                                className={pageIndex <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                        </PaginationItem>
                        {getPageNumbers().map((p, i) =>
                            typeof p === "string" ? (
                                <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                            ) : (
                                <PaginationItem key={p}>
                                    <PaginationLink size="icon" onClick={() => onPageChange(p)} isActive={pageIndex === p} className="cursor-pointer">
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}
                        <PaginationItem>
                            <PaginationNext size="icon" onClick={() => pageIndex < pageCount && onPageChange(pageIndex + 1)}
                                className={pageIndex >= pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
