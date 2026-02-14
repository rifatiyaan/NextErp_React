"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { CategoryFormValues, categorySchema } from "@/schemas/category"
import { categoryAPI } from "@/lib/api/category"
import { Category } from "@/types/category"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"
import { FileDropzone } from "@/components/ui/file-dropzone"

interface CategoryFormProps {
    initialData?: Category
    isEdit?: boolean
}

export default function CategoryForm({ initialData, isEdit }: CategoryFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [images, setImages] = useState<(File | string)[]>([])

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            parentId: initialData?.parentId || undefined,
            metadata: initialData?.metadata || {},
            images: [],
        },
    })

    // Load existing images from initialData
    useEffect(() => {
        if (isEdit && initialData?.assets && initialData.assets.length > 0) {
            const imageUrls = initialData.assets.map(asset => asset.url)
            setImages(imageUrls)
        }
    }, [isEdit, initialData])

    useEffect(() => {
        // Fetch categories for parent selection
        const fetchCategories = async () => {
            try {
                const cats = await categoryAPI.getAllCategories()
                // Filter out self if editing to prevent cycles
                const validParents = isEdit
                    ? cats.filter(c => c.id !== initialData?.id)
                    : cats
                setCategories(validParents)
            } catch (error) {
                console.error("Failed to fetch parent categories", error)
            }
        }
        fetchCategories()
    }, [isEdit, initialData])

    const onSubmit = async (data: CategoryFormValues) => {
        setIsLoading(true)
        try {
            // Get files from images state
            const fileImages = images.filter((img): img is File => img instanceof File)
            
            const payload: CreateCategoryRequest = {
                title: data.title,
                description: data.description || null,
                parentId: data.parentId || null,
                metadata: data.metadata || {},
                images: fileImages.length > 0 ? fileImages : undefined,
            }

            if (isEdit && initialData?.id) {
                await categoryAPI.updateCategory(initialData.id, payload)
                toast.success("Category updated successfully")
            } else {
                await categoryAPI.createCategory(payload)
                toast.success("Category created successfully")
            }
            router.push("/inventory/categories")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error(isEdit ? "Failed to update category" : "Failed to create category")
        } finally {
            setIsLoading(false)
        }
    }

    const handleImagesChange = (files: File[]) => {
        const existingUrls = images.filter((img): img is string => typeof img === "string")
        const newImages = [...existingUrls, ...files]
        setImages(newImages)
        const fileImages = newImages.filter((img): img is File => img instanceof File)
        form.setValue("images", fileImages.length > 0 ? fileImages : undefined)
    }

    const handleImageRemove = (url: string) => {
        const newImages = images.filter(img => img !== url)
        setImages(newImages)
        const fileImages = newImages.filter((img): img is File => img instanceof File)
        form.setValue("images", fileImages.length > 0 ? fileImages : undefined)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">
                    {isEdit ? "Edit Category" : "Create Category"}
                </h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Category title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="parentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent Category</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                                                value={field.value ? String(field.value) : "none"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select parent category (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">No Parent (Root Category)</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={String(category.id)}>
                                                            {category.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Organize this category under another
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Category description"
                                                className="resize-none"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Images</FormLabel>
                                        <FormControl>
                                            <FileDropzone
                                                value={images}
                                                onChange={handleImagesChange}
                                                onUrlRemove={handleImageRemove}
                                                maxFiles={10}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
