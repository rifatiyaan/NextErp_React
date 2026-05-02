"use client"

import { useParams } from "next/navigation"
import CategoryForm from "../_components/category-form"
import { useCategory } from "@/hooks/use-categories"
import { Loader } from "@/components/ui/loader"

export default function EditCategoryPage() {
    const params = useParams()
    const id = params.id ? String(params.id) : undefined
    const { data: category, isPending: loading } = useCategory(id)

    if (loading) {
        return <Loader text="Loading category..." />
    }

    if (!category) {
        return <div>Category not found</div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <CategoryForm initialData={category} isEdit />
        </div>
    )
}
