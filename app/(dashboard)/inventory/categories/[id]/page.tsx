"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import CategoryForm from "../_components/category-form"
import { categoryAPI } from "@/lib/api/category"
import { Category } from "@/types/category"
import { Loader2 } from "lucide-react"

export default function EditCategoryPage() {
    const params = useParams()
    const [category, setCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCategory() {
            try {
                const id = params.id
                if (id) {
                    const data = await categoryAPI.getCategory(String(id))
                    setCategory(data)
                }
            } catch (error) {
                console.error("Failed to fetch category", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCategory()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!category) {
        return <div>Category not found</div>
    }

    return <CategoryForm initialData={category} isEdit />
}
