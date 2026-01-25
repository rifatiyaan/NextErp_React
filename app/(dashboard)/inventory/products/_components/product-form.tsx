"use client"

import { z } from "zod"
import { useEffect, useState, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ChevronLeft, Upload, Plus, X, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

// Mock categories for now - typically fetched from API
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

const SUB_CATEGORIES = [
    { id: 1, title: "Sub Category 1", categoryId: 1 },
    { id: 2, title: "Sub Category 2", categoryId: 1 },
    { id: 3, title: "Sub Category 3", categoryId: 2 },
]

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft", color: "orange" },
    { value: "published", label: "Published", color: "green" },
    { value: "archived", label: "Archived", color: "gray" },
]

interface ProductFormProps {
    initialData?: any
    isEdit?: boolean
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDraftLoading, setIsDraftLoading] = useState(false)
    const [images, setImages] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            title: "",
            code: "",
            barcode: "",
            price: 0,
            discountedPrice: 0,
            stock: 0,
            categoryId: 0,
            subCategoryId: undefined,
            imageUrl: [],
            isActive: true,
            chargeTax: false,
            inStock: true,
            status: "draft",
            variants: [{ option: "", value: "", price: 0 }],
            metadata: {
                description: "",
                color: "",
                warranty: "",
            },
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    })

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return
        const fileArray = Array.from(files)
        setImages((prev) => [...prev, ...fileArray])
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFileSelect(e.dataTransfer.files)
    }, [handleFileSelect])

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: ProductFormValues, publish: boolean = false) => {
        setIsLoading(true)
        try {
            // Convert images array to single file or URL for API
            const imageData = images.length > 0 ? images[0] : data.imageUrl
            
            const submitData = {
                ...data,
                imageUrl: imageData,
                status: publish ? "published" : data.status,
            }

            if (isEdit && initialData?.id) {
                await productAPI.updateProduct(initialData.id, submitData as any)
                toast.success("Product updated successfully")
            } else {
                await productAPI.createProduct(submitData as any)
                toast.success(publish ? "Product published successfully" : "Product saved as draft")
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

    const onSaveDraft = async () => {
        setIsDraftLoading(true)
        const data = form.getValues()
        await onSubmit(data, false)
        setIsDraftLoading(false)
    }

    const onPublish = async () => {
        const data = form.getValues()
        await onSubmit(data, true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Add Products</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading || isDraftLoading}
                    >
                        Discard
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSaveDraft}
                        disabled={isLoading || isDraftLoading}
                    >
                        {isDraftLoading ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button
                        type="button"
                        onClick={onPublish}
                        disabled={isLoading || isDraftLoading}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {isLoading ? "Publishing..." : "Publish"}
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Product Details */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Product Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Product name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SKU</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="SKU" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="barcode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Barcode</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Barcode" {...field} />
                                                    </FormControl>
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
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Product description"
                                                        className="resize-none"
                                                        rows={4}
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Set a description to the product for better visibility.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Product Images */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Product Images</CardTitle>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="h-auto p-0"
                                            asChild
                                        >
                                            <Link href="#">
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                Add media from URL
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                                            isDragging
                                                ? "border-primary bg-primary/5"
                                                : "border-muted-foreground/25"
                                        }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-sm font-medium mb-1">Drop your images here</p>
                                        <p className="text-xs text-muted-foreground">PNG or JPG (max. 5MB)</p>
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleFileSelect(e.target.files)}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("image-upload")?.click()}
                                        className="w-full"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Select images
                                    </Button>
                                    {images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-4 mt-4">
                                            {images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-md"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Variants */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Variants</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                                            <div>Options</div>
                                            <div>Value</div>
                                            <div>Price</div>
                                        </div>
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.option`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a status" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="size">Size</SelectItem>
                                                                    <SelectItem value="color">Color</SelectItem>
                                                                    <SelectItem value="material">Material</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Value" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.price`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Price"
                                                                        {...field}
                                                                        onChange={(e) =>
                                                                            field.onChange(
                                                                                e.target.valueAsNumber || 0
                                                                            )
                                                                        }
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {fields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => append({ option: "", value: "", price: 0 })}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Variant
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Base Price</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.valueAsNumber || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discountedPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discounted Price</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.valueAsNumber || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="chargeTax"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="cursor-pointer">
                                                        Charge tax on this product
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="inStock"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">In stock</FormLabel>
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
                                </CardContent>
                            </Card>

                            {/* Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={`h-2 w-2 rounded-full bg-${status.color}-500`}
                                                                    />
                                                                    {status.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Set the product status.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Categories */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Categories</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name="categoryId"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <Select
                                                        onValueChange={(value) =>
                                                            field.onChange(Number(value))
                                                        }
                                                        value={field.value ? String(field.value) : ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {CATEGORIES.map((category) => (
                                                                <SelectItem
                                                                    key={category.id}
                                                                    value={String(category.id)}
                                                                >
                                                                    {category.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="outline" size="icon">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name="subCategoryId"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <Select
                                                        onValueChange={(value) =>
                                                            field.onChange(Number(value))
                                                        }
                                                        value={field.value ? String(field.value) : ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a sub category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {SUB_CATEGORIES.map((subCategory) => (
                                                                <SelectItem
                                                                    key={subCategory.id}
                                                                    value={String(subCategory.id)}
                                                                >
                                                                    {subCategory.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="outline" size="icon">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
