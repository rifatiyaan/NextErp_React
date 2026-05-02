"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SupplierForm } from "../_components/supplier-form"
import { useSupplier } from "@/hooks/use-suppliers"
import { Loader } from "@/components/ui/loader"

export default function EditSupplierPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const { data: initialData, isPending: isLoading, isError } = useSupplier(id)

    useEffect(() => {
        if (isError) router.push("/inventory/suppliers")
    }, [isError, router])

    if (isLoading) {
        return <Loader text="Loading supplier..." />
    }

    if (!initialData) {
        return (
            <div className="text-center text-muted-foreground">
                Supplier not found.
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
                <p className="text-muted-foreground">
                    Update supplier information
                </p>
            </div>
            <SupplierForm initialData={initialData} isEdit />
        </div>
    )
}
