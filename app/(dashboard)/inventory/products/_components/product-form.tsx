"use client"

import { z } from "zod"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ProductFormValues, VariationOptionFormValues, ProductVariantFormValues } from "@/schemas/product"
import { productAPI } from "@/lib/api/product"
import { categoryAPI } from "@/lib/api/category"
import { variationAPI, type BulkVariationOption } from "@/lib/api/variation"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDropzone } from "@/components/ui/file-dropzone"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ChevronLeft, Plus, X } from "lucide-react"
import type { Category } from "@/types/category"
import { productSchema } from "@/schemas/product"

interface ProductFormProps {
    initialData?: any
    isEdit?: boolean
}

// Auto-generate SKU (alphanumeric)
const generateSKU = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let sku = ""
    for (let i = 0; i < 8; i++) {
        sku += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return sku
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [images, setImages] = useState<(File | string)[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [subCategories, setSubCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({})
    const [originalVariationOptions, setOriginalVariationOptions] = useState<any[]>([])
    const [bulkVariationOptions, setBulkVariationOptions] = useState<BulkVariationOption[]>([])
    const [loadingBulkVariations, setLoadingBulkVariations] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: "",
            code: generateSKU(),
            price: 0,
            stock: 0,
            categoryId: 0,
            subCategoryId: undefined,
            imageUrl: [],
            isActive: true,
            hasVariations: false,
            variationOptions: [],
            productVariants: [],
            metadata: {
                description: "",
                color: "",
                warranty: "",
            },
        },
    })

    const variationOptionsFields = useFieldArray({
        control: form.control,
        name: "variationOptions",
    })

    const productVariantsFields = useFieldArray({
        control: form.control,
        name: "productVariants",
    })

    // Fetch categories and subcategories from real API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true)
                // Fetch all categories from the real backend API
                const allCategories = await categoryAPI.getAllCategories()
                
                // Filter to only show active categories
                // Parent categories: categories without a parentId (null or undefined)
                const parentCategories = allCategories.filter(
                    (cat) => !cat.parentId && cat.isActive
                )
                
                // Subcategories: categories with a parentId
                const childCategories = allCategories.filter(
                    (cat) => cat.parentId != null && cat.isActive
                )
                
                setCategories(parentCategories)
                setSubCategories(childCategories)
            } catch (error) {
                console.error("Failed to fetch categories:", error)
                toast.error("Failed to load categories")
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    // Fetch bulk variation options
    useEffect(() => {
        const fetchBulkVariations = async () => {
            try {
                setLoadingBulkVariations(true)
                const options = await variationAPI.getBulkOptions()
                setBulkVariationOptions(options)
            } catch (error) {
                console.error("Failed to fetch bulk variation options:", error)
            } finally {
                setLoadingBulkVariations(false)
            }
        }
        fetchBulkVariations()
    }, [])

    // Auto-generate SKU on mount if not editing
    useEffect(() => {
        if (!isEdit && !initialData?.code) {
            form.setValue("code", generateSKU())
        }
    }, [isEdit, initialData, form])

    // Load initialData into form when editing
    useEffect(() => {
        if (isEdit && initialData) {
            // Reset form with initial data
            const formData: any = {
                title: initialData.title || "",
                code: initialData.code || generateSKU(),
                price: initialData.price || 0,
                stock: initialData.stock || 0,
                categoryId: initialData.categoryId && initialData.categoryId > 0 ? initialData.categoryId : undefined,
                subCategoryId: initialData.subCategoryId && initialData.subCategoryId > 0 ? initialData.subCategoryId : undefined,
                imageUrl: initialData.imageUrl ? [initialData.imageUrl] : [],
                // Set images state for FileDropzone
                isActive: initialData.isActive ?? true,
                hasVariations: initialData.hasVariations || false,
                variationOptions: [],
                productVariants: [],
                metadata: {
                    description: initialData.metadata?.description || "",
                    color: initialData.metadata?.color || "",
                    warranty: initialData.metadata?.warranty || "",
                },
            }

            // Convert backend variation format to form format
            if (initialData.hasVariations && initialData.variationOptions && Array.isArray(initialData.variationOptions)) {
                const formVariationOptions = initialData.variationOptions.map((opt: any) => ({
                    name: opt.name || "",
                    displayOrder: opt.displayOrder || 0,
                    values: (opt.values || []).map((val: any) => ({
                        value: val.value || "",
                        displayOrder: val.displayOrder || 0,
                    })),
                }))
                formData.variationOptions = formVariationOptions
                // Store original variation options to track which values are original
                setOriginalVariationOptions(formVariationOptions)

                // Convert product variants
                if (initialData.productVariants && Array.isArray(initialData.productVariants)) {
                    const formVariants = initialData.productVariants.map((variant: any) => {
                        // Build variationValueKeys from variationValues
                        const keys: string[] = []
                        if (variant.variationValues && Array.isArray(variant.variationValues)) {
                            variant.variationValues.forEach((vv: any) => {
                                // Find which option and value index this corresponds to
                                formVariationOptions.forEach((opt: any, optIdx: number) => {
                                    opt.values.forEach((val: any, valIdx: number) => {
                                        if (val.value === vv.value) {
                                            keys.push(`${optIdx}:${valIdx}`)
                                        }
                                    })
                                })
                            })
                        }
                        return {
                            sku: variant.sku || "",
                            price: variant.price || 0,
                            stock: variant.stock || 0,
                            isActive: variant.isActive ?? true,
                            variationValueKeys: keys,
                        }
                    })
                    formData.productVariants = formVariants
                }
            }

            // Reset form with all data
            form.reset(formData)
            
            // Set images state for FileDropzone (support both File and string URLs)
            if (initialData.imageUrl) {
                setImages([initialData.imageUrl])
            } else {
                setImages([])
            }
            
            // Ensure field arrays are properly initialized after reset
            // This is needed because form.reset() might not immediately update useFieldArray
            if (formData.hasVariations && formData.variationOptions.length > 0) {
                // Use requestAnimationFrame to ensure form state is updated
                requestAnimationFrame(() => {
                    form.setValue("variationOptions", formData.variationOptions, { shouldDirty: false, shouldValidate: false })
                    if (formData.productVariants.length > 0) {
                        form.setValue("productVariants", formData.productVariants, { shouldDirty: false, shouldValidate: false })
                    }
                })
            }
        }
    }, [isEdit, initialData, form])

    // Filter subcategories based on selected category
    const selectedCategoryId = form.watch("categoryId")
    const filteredSubCategories = subCategories.filter(
        (subCat) => subCat.parentId === selectedCategoryId
    )

    const handleImagesChange = (files: File[]) => {
        // Keep existing URL strings and add new files
        const existingUrls = images.filter((img): img is string => typeof img === "string")
        setImages([...existingUrls, ...files])
        form.setValue("imageUrl", files as any)
    }

    // Generate all possible variant combinations from variation options
    const generateVariants = useCallback(() => {
        const options = form.getValues("variationOptions") || []
        if (options.length === 0) {
            form.setValue("productVariants", [])
            return
        }

        // Generate all combinations using cartesian product
        const combinations: string[][] = []
        const generateCombinations = (current: string[], optionIndex: number) => {
            if (optionIndex >= options.length) {
                combinations.push([...current])
                return
            }
            const option = options[optionIndex]
            option.values.forEach((_, valueIndex) => {
                generateCombinations([...current, `${optionIndex}:${valueIndex}`], optionIndex + 1)
            })
        }
        generateCombinations([], 0)

        // Create or update variants
        const existingVariants = form.getValues("productVariants") || []
        const newVariants: ProductVariantFormValues[] = combinations.map((keys, index) => {
            // Try to find existing variant with same keys
            const existing = existingVariants.find(
                (v) => JSON.stringify(v.variationValueKeys.sort()) === JSON.stringify(keys.sort())
            )
            
            if (existing) {
                return existing
            }

            // Generate variant title from values
            const variantTitle = keys
                .map((key) => {
                    const [optIdx, valIdx] = key.split(":").map(Number)
                    return options[optIdx]?.values[valIdx]?.value || ""
                })
                .filter(Boolean)
                .join(" / ")

            // Generate SKU
            const baseCode = form.getValues("code") || "PROD"
            const variantSuffix = keys
                .map((key) => {
                    const [optIdx, valIdx] = key.split(":").map(Number)
                    const value = options[optIdx]?.values[valIdx]?.value || ""
                    return value.substring(0, 3).toUpperCase()
                })
                .join("-")
            const sku = `${baseCode}-${variantSuffix}`

            return {
                sku,
                price: form.getValues("price") || 0,
                stock: 0,
                isActive: true,
                variationValueKeys: keys,
            }
        })

        form.setValue("productVariants", newVariants, { shouldDirty: false })
    }, [form])

    // Watch for changes in variation options and regenerate variants
    const watchedVariationOptions = form.watch("variationOptions")
    const hasVariations = form.watch("hasVariations")
    
    // Use refs to track previous values and prevent infinite loops
    const isGeneratingRef = useRef(false)
    const previousOptionsRef = useRef<string>("")
    const isInitialMountRef = useRef(true)

    useEffect(() => {
        // Skip on initial mount
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false
            return
        }

        // Prevent infinite loops
        if (isGeneratingRef.current) {
            return
        }

        // Don't run if hasVariations is false
        if (!hasVariations) {
            // Only clear if we previously had variations
            if (previousOptionsRef.current !== "") {
                previousOptionsRef.current = ""
                form.setValue("productVariants", [], { shouldDirty: false, shouldValidate: false })
                form.setValue("variationOptions", [], { shouldDirty: false, shouldValidate: false })
            }
            return
        }

        // Only proceed if hasVariations is true
        if (!watchedVariationOptions || watchedVariationOptions.length === 0) {
            return
        }

        // Serialize options to detect actual changes
        const optionsKey = JSON.stringify(
            watchedVariationOptions.map(opt => ({
                name: opt?.name,
                values: opt?.values?.map(v => v?.value) || []
            }))
        )

        // Skip if options haven't actually changed
        if (previousOptionsRef.current === optionsKey) {
            return
        }

        // Check if all options have at least one value
        const allOptionsValid = watchedVariationOptions.every(
            (opt) => opt && opt.values && opt.values.length > 0
        )
        
        if (allOptionsValid && watchedVariationOptions.length > 0) {
            isGeneratingRef.current = true
            previousOptionsRef.current = optionsKey
            generateVariants()
            // Reset flag after a short delay to allow state updates to complete
            requestAnimationFrame(() => {
                isGeneratingRef.current = false
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedVariationOptions, hasVariations])

    const onSubmit = async (data: ProductFormValues) => {
        setIsLoading(true)
        try {
            // Prepare image data - use first File if available, otherwise use first URL string, otherwise use data.imageUrl
            const firstFile = images.find((img): img is File => img instanceof File)
            const firstUrl = images.find((img): img is string => typeof img === "string")
            const imageData = firstFile || firstUrl || data.imageUrl

            const submitData: any = {
                ...data,
                imageUrl: imageData,
            }

            // If product has variations, ensure variation data is included
            if (data.hasVariations) {
                submitData.hasVariations = true
                submitData.variationOptions = (data.variationOptions || []).filter((opt: any) => opt.name && opt.values && opt.values.length > 0)
                submitData.productVariants = (data.productVariants || []).filter((v: any) => v.sku && v.variationValueKeys && v.variationValueKeys.length > 0)
                
                // Validate that we have valid variation data
                if (submitData.variationOptions.length === 0 || submitData.productVariants.length === 0) {
                    toast.error("Please add at least one variation option with values and ensure variants are generated")
                    setIsLoading(false)
                    return
                }
            } else {
                submitData.hasVariations = false
                submitData.variationOptions = []
                submitData.productVariants = []
            }
            
            // Debug logging (remove in production)
            console.log("Submitting product data:", {
                hasVariations: submitData.hasVariations,
                variationOptionsCount: submitData.variationOptions?.length || 0,
                productVariantsCount: submitData.productVariants?.length || 0,
            })

            if (isEdit && initialData?.id) {
                await productAPI.updateProduct(initialData.id, submitData)
                toast.success("Product updated successfully")
            } else {
                await productAPI.createProduct(submitData)
                toast.success("Product created successfully")
            }
            router.push("/inventory/products")
            router.refresh()
        } catch (error: any) {
            console.error(error)
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                (isEdit ? "Failed to update product" : "Failed to create product")
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const onSave = async () => {
        const isValid = await form.trigger()
        if (!isValid) {
            toast.error("Please fix form errors before saving")
            return
        }
        const data = form.getValues()
        await onSubmit(data)
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-semibold">{isEdit ? "Edit Product" : "Add Products"}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Discard
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={onSave}
                        disabled={isLoading}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                    <div className="grid gap-2 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-2">
                            {/* Product Details */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-base font-medium">Product Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 pt-0 px-4 pb-3">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Product name" {...field} />
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
                                                <FormLabel>SKU *</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            placeholder="SKU (alphanumeric only)" 
                                                            {...field}
                                                            onChange={(e) => {
                                                                // Only allow alphanumeric characters
                                                                const value = e.target.value.replace(/[^A-Za-z0-9]/g, '')
                                                                field.onChange(value)
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newSKU = generateSKU()
                                                                field.onChange(newSKU)
                                                            }}
                                                        >
                                                            Generate
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    Auto-generated SKU (alphanumeric, click Generate to create new one)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-base font-medium">Product Images</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 px-4 pb-3">
                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <FileDropzone
                                                        value={images}
                                                        onChange={handleImagesChange}
                                                        onUrlRemove={(url) => {
                                                            setImages(prev => prev.filter(img => img !== url))
                                                            // If this was the only image, clear form value
                                                            const remaining = images.filter(img => img !== url)
                                                            if (remaining.length === 0) {
                                                                form.setValue("imageUrl", undefined)
                                                            }
                                                        }}
                                                        maxFiles={10}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Variations Toggle */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-base font-medium">Product Variations</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 px-4 pb-3">
                                    <FormField
                                        control={form.control}
                                        name="hasVariations"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        This product has variations
                                                    </FormLabel>
                                                    <FormDescription>
                                                        {isEdit ? "Variations cannot be edited after product creation" : "Enable to add variation options (e.g., Size, Color) and create product variants"}
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        disabled={isEdit}
                                                        onCheckedChange={(checked) => {
                                                            if (!isEdit) {
                                                                field.onChange(checked)
                                                                if (!checked) {
                                                                    form.setValue("variationOptions", [])
                                                                    form.setValue("productVariants", [])
                                                                } else {
                                                                    form.setValue("variationOptions", [
                                                                        { name: "", displayOrder: 0, values: [] },
                                                                    ])
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Variation Options Management - Compact Side-by-Side Column Layout */}
                            {hasVariations && (
                                <>
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader className="pb-2 pt-3 px-4">
                                            <CardTitle className="text-base font-medium">Variation Options</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0 px-4 pb-3">
                                            <div className="space-y-2">
                                                {variationOptionsFields.fields.map((field, optionIndex) => {
                                                    const currentValues = form.watch(`variationOptions.${optionIndex}.values`) || []
                                                    const newValue = newValueInputs[optionIndex] || ""
                                                    const selectedOptionName = form.watch(`variationOptions.${optionIndex}.name`)
                                                    const availableValues = bulkVariationOptions.find(opt => opt.name === selectedOptionName)?.values || []

                                                    return (
                                                        <div key={field.id} className="grid grid-cols-[200px_1fr_auto] gap-2 items-start border-b pb-2 last:border-b-0">
                                                            {/* Option Name Column */}
                                                            <div className="flex items-center gap-1">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`variationOptions.${optionIndex}.name`}
                                                                    render={({ field }) => {
                                                                        const isCustomOption = field.value && !bulkVariationOptions.some(opt => opt.name === field.value)
                                                                        return (
                                                                            <FormItem className="flex-1">
                                                                                <FormControl>
                                                                                    {!isEdit ? (
                                                                                        <div className="flex gap-1">
                                                                                            <Select
                                                                                                value={isCustomOption ? "" : (field.value || "")}
                                                                                                onValueChange={(value) => {
                                                                                                    if (value === "") {
                                                                                                        field.onChange("")
                                                                                                        form.setValue(`variationOptions.${optionIndex}.values`, [])
                                                                                                    } else {
                                                                                                        field.onChange(value)
                                                                                                        const bulkOption = bulkVariationOptions.find(opt => opt.name === value)
                                                                                                        if (bulkOption && bulkOption.values.length > 0) {
                                                                                                            form.setValue(
                                                                                                                `variationOptions.${optionIndex}.values`,
                                                                                                                bulkOption.values.map((val, idx) => ({
                                                                                                                    value: val,
                                                                                                                    displayOrder: idx
                                                                                                                }))
                                                                                                            )
                                                                                                            generateVariants()
                                                                                                        } else {
                                                                                                            form.setValue(`variationOptions.${optionIndex}.values`, [])
                                                                                                        }
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <SelectTrigger className="h-8 text-sm">
                                                                                                    <SelectValue placeholder="Select option..." />
                                                                                                </SelectTrigger>
                                                                                                <SelectContent>
                                                                                                    <SelectItem value="">-- New Option --</SelectItem>
                                                                                                    {bulkVariationOptions.map((opt) => (
                                                                                                        <SelectItem key={opt.name} value={opt.name}>
                                                                                                            {opt.name}
                                                                                                        </SelectItem>
                                                                                                    ))}
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                            {(isCustomOption || field.value === "") && (
                                                                                                <Input
                                                                                                    placeholder="Type option..."
                                                                                                    value={field.value || ""}
                                                                                                    onChange={(e) => {
                                                                                                        field.onChange(e.target.value)
                                                                                                        if (!e.target.value) {
                                                                                                            form.setValue(`variationOptions.${optionIndex}.values`, [])
                                                                                                        }
                                                                                                    }}
                                                                                                    className="h-8 text-sm"
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <Input
                                                                                            value={field.value || ""}
                                                                                            className="h-8 text-sm font-medium"
                                                                                            readOnly
                                                                                            disabled
                                                                                        />
                                                                                    )}
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>

                                                            {/* Values Column */}
                                                            <div className="flex flex-wrap items-center gap-1 min-h-[32px]">
                                                                {currentValues.map((val: any, valueIndex: number) => {
                                                                    const originalOption = isEdit && originalVariationOptions.length > optionIndex 
                                                                        ? originalVariationOptions[optionIndex] 
                                                                        : null
                                                                    const isOriginalValue = isEdit && originalOption 
                                                                        ? originalOption.values.some((ov: any) => ov.value === val.value)
                                                                        : false
                                                                    
                                                                    return (
                                                                        <div
                                                                            key={valueIndex}
                                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted border rounded text-xs"
                                                                        >
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`variationOptions.${optionIndex}.values.${valueIndex}.value`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="m-0">
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                {...field}
                                                                                                className="h-5 w-16 px-1 text-xs border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 p-0"
                                                                                                disabled={isEdit && isOriginalValue}
                                                                                                readOnly={isEdit && isOriginalValue}
                                                                                                onBlur={() => !isEdit && generateVariants()}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                            {(!isEdit || !isOriginalValue) && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-4 w-4 hover:bg-destructive/10 hover:text-destructive"
                                                                                    onClick={() => {
                                                                                        const values = form.getValues(
                                                                                            `variationOptions.${optionIndex}.values`
                                                                                        ) || []
                                                                                        values.splice(valueIndex, 1)
                                                                                        form.setValue(
                                                                                            `variationOptions.${optionIndex}.values`,
                                                                                            values
                                                                                        )
                                                                                        generateVariants()
                                                                                    }}
                                                                                >
                                                                                    <X className="h-3 w-3" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                                
                                                                {/* Add Value Input */}
                                                                {!isEdit && selectedOptionName && (
                                                                    <div className="flex items-center gap-1">
                                                                        {availableValues.length > 0 && (
                                                                            <Select
                                                                                value=""
                                                                                onValueChange={(value) => {
                                                                                    if (value && !currentValues.some((v: any) => v.value === value)) {
                                                                                        const values = form.getValues(
                                                                                            `variationOptions.${optionIndex}.values`
                                                                                        ) || []
                                                                                        form.setValue(
                                                                                            `variationOptions.${optionIndex}.values`,
                                                                                            [...values, { value, displayOrder: values.length }]
                                                                                        )
                                                                                        generateVariants()
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="h-7 text-xs w-24">
                                                                                    <SelectValue placeholder="Select..." />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {availableValues
                                                                                        .filter(val => !currentValues.some((v: any) => v.value === val))
                                                                                        .map((val) => (
                                                                                            <SelectItem key={val} value={val}>
                                                                                                {val}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                        <Input
                                                                            placeholder="Type & Enter"
                                                                            value={newValue}
                                                                            onChange={(e) => {
                                                                                setNewValueInputs(prev => ({
                                                                                    ...prev,
                                                                                    [optionIndex]: e.target.value
                                                                                }))
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter" && newValue.trim()) {
                                                                                    e.preventDefault()
                                                                                    const values = form.getValues(
                                                                                        `variationOptions.${optionIndex}.values`
                                                                                    ) || []
                                                                                    if (!values.some((v: any) => v.value === newValue.trim())) {
                                                                                        form.setValue(
                                                                                            `variationOptions.${optionIndex}.values`,
                                                                                            [...values, { value: newValue.trim(), displayOrder: values.length }]
                                                                                        )
                                                                                        setNewValueInputs(prev => {
                                                                                            const updated = { ...prev }
                                                                                            delete updated[optionIndex]
                                                                                            return updated
                                                                                        })
                                                                                        generateVariants()
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="h-7 text-xs w-24"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {isEdit && (
                                                                    <Input
                                                                        placeholder="Type & Enter"
                                                                        value={newValue}
                                                                        onChange={(e) => {
                                                                            setNewValueInputs(prev => ({
                                                                                ...prev,
                                                                                [optionIndex]: e.target.value
                                                                            }))
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter" && newValue.trim()) {
                                                                                e.preventDefault()
                                                                                const values = form.getValues(
                                                                                    `variationOptions.${optionIndex}.values`
                                                                                ) || []
                                                                                if (!values.some((v: any) => v.value === newValue.trim())) {
                                                                                    form.setValue(
                                                                                        `variationOptions.${optionIndex}.values`,
                                                                                        [...values, { value: newValue.trim(), displayOrder: values.length }]
                                                                                    )
                                                                                    setNewValueInputs(prev => {
                                                                                        const updated = { ...prev }
                                                                                        delete updated[optionIndex]
                                                                                        return updated
                                                                                    })
                                                                                    generateVariants()
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="h-7 text-xs w-24"
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Remove Button Column */}
                                                            {variationOptionsFields.fields.length > 1 && !isEdit && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => {
                                                                        variationOptionsFields.remove(optionIndex)
                                                                        setNewValueInputs(prev => {
                                                                            const updated = { ...prev }
                                                                            delete updated[optionIndex]
                                                                            const reindexed: Record<number, string> = {}
                                                                            Object.keys(updated).forEach(key => {
                                                                                const idx = parseInt(key)
                                                                                if (idx > optionIndex) {
                                                                                    reindexed[idx - 1] = updated[idx]
                                                                                } else if (idx < optionIndex) {
                                                                                    reindexed[idx] = updated[idx]
                                                                                }
                                                                            })
                                                                            return reindexed
                                                                        })
                                                                        generateVariants()
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            
                                            {/* Add New Option Button */}
                                            {!isEdit && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        variationOptionsFields.append({
                                                            name: "",
                                                            displayOrder: variationOptionsFields.fields.length,
                                                            values: [],
                                                        })
                                                    }}
                                                    className="w-full border-dashed mt-3"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Variation Option
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Product Variants Table */}
                                    {productVariantsFields.fields.length > 0 && (
                                        <Card className="border-0 shadow-sm">
                                            <CardHeader className="pb-2 pt-3 px-4">
                                                <CardTitle className="text-base font-medium">Product Variants</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0 px-4 pb-3">
                                                <div className="rounded border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Combination</TableHead>
                                                                <TableHead>SKU</TableHead>
                                                                <TableHead>Price</TableHead>
                                                                <TableHead>Stock</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {productVariantsFields.fields.map((field, variantIndex) => {
                                                                const variant = form.watch(`productVariants.${variantIndex}`)
                                                                const combination = variant?.variationValueKeys
                                                                    ?.map((key: string) => {
                                                                        const [optIdx, valIdx] = key.split(":").map(Number)
                                                                        const option = form.getValues(
                                                                            `variationOptions.${optIdx}`
                                                                        )
                                                                        return option?.values[valIdx]?.value || ""
                                                                    })
                                                                    .filter(Boolean)
                                                                    .join(" / ") || ""

                                                                return (
                                                                    <TableRow key={field.id}>
                                                                        <TableCell className="font-medium">
                                                                            {combination}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`productVariants.${variantIndex}.sku`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                {...field}
                                                                                                className="w-32"
                                                                                                onChange={(e) => {
                                                                                                    const value = e.target.value.replace(/[^A-Za-z0-9-]/g, '')
                                                                                                    field.onChange(value)
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`productVariants.${variantIndex}.price`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                step="0.01"
                                                                                                {...field}
                                                                                                className="w-24"
                                                                                                onChange={(e) =>
                                                                                                    field.onChange(e.target.valueAsNumber || 0)
                                                                                                }
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`productVariants.${variantIndex}.stock`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                {...field}
                                                                                                className="w-20"
                                                                                                onChange={(e) =>
                                                                                                    field.onChange(e.target.valueAsNumber || 0)
                                                                                                }
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2">
                            {/* Pricing */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-base font-medium">Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 pt-0 px-4 pb-3">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {hasVariations ? "Base Price (for variants)" : "Price *"}
                                                </FormLabel>
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
                                                <FormDescription>
                                                    {hasVariations
                                                        ? "Default price for variants (can be overridden per variant)"
                                                        : "Product price"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Categories */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-base font-medium">Categories</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 pt-0 px-4 pb-3">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category *</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={categories.map((cat) => ({
                                                            value: String(cat.id),
                                                            label: cat.title,
                                                        }))}
                                                        value={field.value && field.value > 0 ? String(field.value) : undefined}
                                                        onValueChange={(value) => {
                                                            const numValue = value ? Number(value) : undefined
                                                            field.onChange(numValue && numValue > 0 ? numValue : undefined)
                                                            // Reset subcategory when category changes
                                                            form.setValue("subCategoryId", undefined)
                                                        }}
                                                        placeholder="Select a category"
                                                        searchPlaceholder="Search categories..."
                                                        emptyMessage="No categories found."
                                                        disabled={loadingCategories}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {selectedCategoryId && selectedCategoryId > 0 && (
                                        <FormField
                                            control={form.control}
                                            name="subCategoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sub Category</FormLabel>
                                                    <FormControl>
                                                        <Combobox
                                                            options={filteredSubCategories.map((cat) => ({
                                                                value: String(cat.id),
                                                                label: cat.title,
                                                            }))}
                                                            value={field.value && field.value > 0 ? String(field.value) : undefined}
                                                            onValueChange={(value) => {
                                                                const numValue = value ? Number(value) : undefined
                                                                field.onChange(numValue && numValue > 0 ? numValue : undefined)
                                                            }}
                                                            placeholder="Select a sub category"
                                                            searchPlaceholder="Search subcategories..."
                                                            emptyMessage="No subcategories found."
                                                            disabled={loadingCategories || filteredSubCategories.length === 0}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        {filteredSubCategories.length === 0
                                                            ? "This category has no subcategories"
                                                            : `${filteredSubCategories.length} subcategor${filteredSubCategories.length === 1 ? "y" : "ies"} available`}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
