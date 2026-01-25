"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useParams, useRouter } from "next/navigation"
import { customerAPI } from "@/lib/api/customer"
import { Customer } from "@/types/customer"
import { CustomerForm } from "../_components/customer-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const data = await customerAPI.getCustomerById(id)
                setCustomer(data)
            } catch (error) {
                console.error("Failed to fetch customer:", error)
                router.push("/inventory/customers")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchCustomer()
        }
    }, [id, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!customer) {
        return null
    }

    return (
        <div className="space-y-6">
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

