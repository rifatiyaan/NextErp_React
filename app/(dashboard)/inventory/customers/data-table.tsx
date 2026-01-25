"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
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
import { ColumnVisibility } from "./_components/ColumnVisibility"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount: number
    pageIndex: number
    pageSize: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pageIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination: {
                pageIndex: pageIndex - 1,
                pageSize: pageSize,
            },
        },
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // Helper to generate page numbers
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (pageCount <= maxVisiblePages) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(i)
            }
        } else {
            const startPage = Math.max(1, pageIndex - 2)
            const endPage = Math.min(pageCount, pageIndex + 2)

            if (startPage > 1) {
                pages.push(1)
                if (startPage > 2) {
                    pages.push("ellipsis-start")
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }

            if (endPage < pageCount) {
                if (endPage < pageCount - 1) {
                    pages.push("ellipsis-end")
                }
                pages.push(pageCount)
            }
        }

        return pages
    }

    return (
        <div className="space-y-3">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Rows per page
                    </p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            onPageSizeChange(Number(value))
                            onPageChange(1)
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ColumnVisibility table={table} />
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                size="icon"
                                onClick={() => {
                                    if (pageIndex > 1) {
                                        onPageChange(pageIndex - 1)
                                    }
                                }}
                                className={
                                    pageIndex <= 1
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>
                        {getPageNumbers().map((page, index) => {
                            if (page === "ellipsis-start" || page === "ellipsis-end") {
                                return (
                                    <PaginationItem key={`ellipsis-${index}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )
                            }
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        size="icon"
                                        onClick={() => onPageChange(page as number)}
                                        isActive={pageIndex === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        })}
                        <PaginationItem>
                            <PaginationNext
                                size="icon"
                                onClick={() => {
                                    if (pageIndex < pageCount) {
                                        onPageChange(pageIndex + 1)
                                    }
                                }}
                                className={
                                    pageIndex >= pageCount
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}

