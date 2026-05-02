"use client"

import { useMemo, useState } from "react"
import { useCategoriesList } from "@/hooks/use-categories"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { Plus } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import { TopBar } from "@/components/layout/TopBar"

export default function CategoriesPage() {
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data: response, isPending: loading } = useCategoriesList({
        pageIndex,
        pageSize,
    })

    const data = useMemo(() => response?.data ?? [], [response])
    const total = response?.total ?? 0
    const pageCount = Math.ceil(total / pageSize) || 1
    const columns = createColumns({ pageIndex, pageSize })

    return (
        <div className="space-y-3">
            <TopBar
                title="Categories"
                actions={[
                    {
                        label: "Add New Category",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => window.location.href = "/inventory/categories/create",
                        variant: "default",
                        size: "sm",
                    },
                ]}
            />

            {loading ? (
                <Loader text="Loading categories..." />
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onPageChange={setPageIndex}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPageIndex(1) // Reset to first page on size change
                    }}
                />
            )}
        </div>
    )
}
