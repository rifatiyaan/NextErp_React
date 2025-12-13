import { productAPI } from "@/lib/api/product"
import ProductForm from "../_components/product-form"
import { notFound } from "next/navigation"

interface EditProductPageProps {
    params: {
        id: string
    }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    // Next.js 15+ allows async params access directly or via await depending on version
    // For safety in App Router, we usually await fetches in server component

    // Note: params might need to be awaited in future Next.js versions, but typically string in current stable 14/15
    const id = params.id

    let product
    try {
        product = await productAPI.getProduct(id)
    } catch (error) {
        notFound()
    }

    if (!product) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            <ProductForm initialData={product} isEdit />
        </div>
    )
}
