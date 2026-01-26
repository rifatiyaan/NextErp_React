"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SupplierForm } from "../_components/supplier-form"
import { supplierAPI } from "@/lib/api/supplier"
import { Supplier } from "@/types/supplier"
import { Loader } from "@/components/ui/loader"

export default function EditSupplierPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const [paramsData, setParamsData] = useState<{ id: string } | null>(null)
    const [initialData, setInitialData] = useState<Supplier | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        params.then((p) => setParamsData(p))
    }, [params])

    useEffect(() => {
        const fetchSupplier = async () => {
            if (!paramsData?.id) return

            try {
                const supplier = await supplierAPI.getSupplierById(
                    parseInt(paramsData.id)
                )
                setInitialData(supplier)
            } catch (error) {
                console.error("Failed to fetch supplier:", error)
                router.push("/inventory/suppliers")
            } finally {
                setIsLoading(false)
            }
        }

        if (paramsData) {
            fetchSupplier()
        }
    }, [paramsData, router])

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
        <div className="space-y-6">
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

