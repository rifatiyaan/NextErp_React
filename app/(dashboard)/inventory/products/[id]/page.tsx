"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProductForm from "../_components/product-form"
import { productAPI } from "@/lib/api/product"
import { Product } from "@/types/product"
import { Loader } from "@/components/ui/loader"

export default function EditProductPage() {
    const params = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProduct() {
            try {
                const id = params.id
                if (id) {
                    const data = await productAPI.getProduct(String(id))
                    setProduct(data)
                }
            } catch (error) {
                console.error("Failed to fetch product", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [params.id])

    if (loading) {
        return <Loader text="Loading product..." />
    }

    if (!product) {
        return <div>Product not found</div>
    }

    return (
        <div className="w-full max-w-[1920px] mx-auto">
            <ProductForm initialData={product} isEdit />
        </div>
    )
}
