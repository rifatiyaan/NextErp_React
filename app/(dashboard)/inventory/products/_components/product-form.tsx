"use client"


import { z } from "zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ProductFormValues, productSchema } from "@/schemas/product"
import { productAPI } from "@/lib/api/product"
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

// Mock categories for now - typically typically fetched from API
const CATEGORIES = [
    { id: 1, title: "Electronics" },
    { id: 2, title: "Clothing" },
    { id: 3, title: "Books" },
    { id: 4, title: "Home & Kitchen" },
    { id: 5, title: "Sports" },
    { id: 6, title: "Toys" },
    { id: 7, title: "Beauty" },
    { id: 8, title: "Automotive" },
    { id: 9, title: "Garden" },
    { id: 10, title: "Furniture" },
]

interface ProductFormProps {
    initialData?: any // simplified for now, should be Product
    isEdit?: boolean
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            title: "",
            code: "",
            price: 0,
            stock: 0,
            categoryId: 0,
            imageUrl: "",
            isActive: true,
            metadata: {
                description: "",
                color: "",
                warranty: "",
            },
        },
    })

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            if (isEdit && initialData?.id) {
                // Ensure ID is passed for update if distinct from data
                await productAPI.updateProduct(initialData.id, data as any)
                toast.success("Product updated successfully")
            } else {
                await productAPI.createProduct(data as any)
                toast.success("Product created successfully")
            }
            router.push("/inventory/products")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error(isEdit ? "Failed to update product" : "Failed to create product")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">
                    {isEdit ? "Edit Product" : "Create Product"}
                </h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
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
                                                <Input placeholder="Product title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Product code (SKU)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                defaultValue={field.value ? String(field.value) : undefined}
                                                value={field.value ? String(field.value) : ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CATEGORIES.map((category) => (
                                                        <SelectItem key={category.id} value={String(category.id)}>
                                                            {category.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel>Product Image</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-4">
                                                    {/* Show preview if value is a string (URL) or File, otherwise placeholder */}
                                                    <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                                                        <img
                                                            src={
                                                                value instanceof File
                                                                    ? URL.createObjectURL(value)
                                                                    : (typeof value === "string" && value.length > 0)
                                                                        ? value
                                                                        : "https://placehold.co/600x400/png"
                                                            }
                                                            alt="Product preview"
                                                            className="h-full w-full object-cover"
                                                            onLoad={() => {
                                                                if (value instanceof File) {
                                                                    URL.revokeObjectURL(value as any)
                                                                }
                                                            }}
                                                        />
                                                        {(value instanceof File || (typeof value === "string" && value.length > 0)) && (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute right-0 top-0 h-6 w-6 rounded-bl-md rounded-tr-none"
                                                                onClick={() => onChange("")}
                                                            >
                                                                <span className="sr-only">Remove image</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <Input
                                                        {...fieldProps}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(event) => {
                                                            const file = event.target.files && event.target.files[0]
                                                            if (file) {
                                                                onChange(file)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Upload a product image</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="metadata.description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Product description"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="metadata.color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Red, Black" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="metadata.warranty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Warranty</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 1 Year" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active Status</FormLabel>
                                            <FormDescription>
                                                Visible in store
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
