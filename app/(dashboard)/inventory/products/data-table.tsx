"use client"

import { useEffect } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    Table as TanStackTable,
} from "@tanstack/react-table"

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
import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount: number
    pageIndex: number
    pageSize: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange: (pageSize: number) => void
    onRowDoubleClick?: (row: TData) => void
    onTableReady?: (table: TanStackTable<TData>) => void
    className?: string
    pageSizeSelectClassName?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pageIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onRowDoubleClick,
    onTableReady,
    className,
    pageSizeSelectClassName,
}: DataTableProps<TData, TValue>) {
    const radiusClass = useRadiusClass()
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination: {
                pageIndex: pageIndex - 1,
                pageSize: pageSize,
            },
            rowSelection: {},
        },
        enableRowSelection: true,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // Expose table instance to parent
    useEffect(() => {
        if (onTableReady) {
            onTableReady(table)
        }
    }, [table, onTableReady])

    // Helper to generate page numbers
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (pageCount <= maxVisiblePages) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(i)
            }
        } else {
            // Always show first, last, and pages around current
            if (pageIndex <= 3) {
                // Near start: 1, 2, 3, 4, ..., 20
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("ellipsis")
                pages.push(pageCount)
            } else if (pageIndex >= pageCount - 2) {
                // Near end: 1, ..., 17, 18, 19, 20
                pages.push(1)
                pages.push("ellipsis")
                for (let i = pageCount - 3; i <= pageCount; i++) {
                    pages.push(i)
                }
            } else {
                // Middle: 1, ..., 9, 10, 11, ..., 20
                pages.push(1)
                pages.push("ellipsis")
                pages.push(pageIndex - 1)
                pages.push(pageIndex)
                pages.push(pageIndex + 1)
                pages.push("ellipsis")
                pages.push(pageCount)
            }
        }
        return pages
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div
                className={cn(
                    "overflow-hidden",
                    radiusClass
                )}
            >
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-7 px-2 text-[11px]">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            <>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        onDoubleClick={() => onRowDoubleClick?.(row.original)}
                                        className={cn(
                                            onRowDoubleClick ? "cursor-pointer" : "",
                                            "h-8"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-2 py-1">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {Array.from({ length: pageSize - table.getRowModel().rows.length }).map((_, index) => (
                                    <TableRow key={`empty-${index}`} className="h-8">
                                        <TableCell colSpan={columns.length}>
                                            &nbsp;
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-16 text-center text-xs text-muted-foreground"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between border-t bg-muted/30 px-2 py-1.5">
                <div className="flex items-center space-x-2">
                    <p className="text-[11px] text-muted-foreground">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            onPageSizeChange(Number(value))
                        }}
                    >
                        <SelectTrigger
                            className={cn("h-7 w-[65px] text-xs", pageSizeSelectClassName)}
                        >
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                size="default"
                                onClick={(e) => { e.preventDefault(); if (pageIndex > 1) onPageChange(pageIndex - 1) }}
                                className={pageIndex <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        {getPageNumbers().map((page, i) => (
                            <PaginationItem key={i}>
                                {page === "ellipsis" ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={page === pageIndex}
                                        size="icon"
                                        onClick={(e) => { e.preventDefault(); onPageChange(Number(page)) }}
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                size="default"
                                onClick={(e) => { e.preventDefault(); if (pageIndex < pageCount) onPageChange(pageIndex + 1) }}
                                className={pageIndex >= pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
