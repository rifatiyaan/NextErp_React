"use client"

import { useParams } from "next/navigation"
import ProductForm from "../_components/product-form"
import { useProduct } from "@/hooks/use-products"
import { Loader } from "@/components/ui/loader"

export default function EditProductPage() {
    const params = useParams()
    const id = params.id ? String(params.id) : undefined
    const { data: product, isPending: loading } = useProduct(id)

    if (loading) {
        return <Loader text="Loading product..." />
    }

    if (!product) {
        return <div>Product not found</div>
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-1 sm:px-2">
            <ProductForm initialData={product} isEdit />
        </div>
    )
}
