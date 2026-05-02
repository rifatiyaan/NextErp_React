"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CustomerForm } from "../_components/customer-form"
import { useCustomer } from "@/hooks/use-customers"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"

export default function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const { data: customer, isPending: loading, isError } = useCustomer(id)

    // On not-found / fetch failure, send the user back to the list.
    useEffect(() => {
        if (isError) router.push("/inventory/customers")
    }, [isError, router])

    if (loading) {
        return <Loader text="Loading customer..." />
    }

    if (!customer) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/inventory/customers">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Edit Customer
                    </h1>
                    <p className="text-muted-foreground">
                        Update customer information
                    </p>
                </div>
            </div>
            <CustomerForm initialData={customer} isEdit={true} />
        </div>
    )
}
