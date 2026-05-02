"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ProductFormValues, ProductVariantFormValues } from "@/schemas/product"
import { useProductFormLookups } from "@/hooks/use-product-form-lookups"
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products"
import { applyValidationErrors } from "@/lib/query/rhf"
import Link from "next/link"
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
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ChevronLeft, Plus, Star, X, Package, Upload } from "lucide-react"
import type { Category } from "@/types/category"
import { productSchema } from "@/schemas/product"

interface ProductFormProps {
    initialData?: any
    isEdit?: boolean
}

function codeFromTitle(title: string): string {
    const raw = title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9]+/g, "")
        .slice(0, 40)
    return raw.length > 0 ? raw : "ITEM"
}

function variantLetterSuffix(index: number): string {
    let n = index + 1
    let s = ""
    while (n > 0) {
        n--
        s = String.fromCharCode(97 + (n % 26)) + s
        n = Math.floor(n / 26)
    }
    return s
}

function newGalleryKey(): string {
    return `g-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type GallerySlot = {
    key: string
    url?: string
    file?: File
    preview: string | null
    serverId?: number
}

function buildValueToVariationKeyMap(
    options: ReadonlyArray<{ values?: ReadonlyArray<{ value?: string }> }>
): Map<string, string> {
    const map = new Map<string, string>()
    options.forEach((opt, optIdx) => {
        ;(opt.values ?? []).forEach((val, valIdx) => {
            const v = (val.value ?? "").trim()
            if (v && !map.has(v)) map.set(v, `${optIdx}:${valIdx}`)
        })
    })
    return map
}

function cartesianVariationKeys(
    options: ReadonlyArray<{ values?: ReadonlyArray<unknown> }>
): string[][] {
    const build = (i: number, prefix: string[]): string[][] =>
        i >= options.length
            ? [prefix]
            : (options[i].values ?? []).flatMap((_, valueIndex) =>
                  build(i + 1, [...prefix, `${i}:${valueIndex}`])
              )

    return options.length === 0 ? [] : build(0, [])
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
    const router = useRouter()
    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()
    const isLoading = createProduct.isPending || updateProduct.isPending
    const [gallerySlots, setGallerySlots] = useState<GallerySlot[]>([])
    const [thumbnailKey, setThumbnailKey] = useState<string | null>(null)
    const galleryDirtyRef = useRef(false)
    const codeManuallyEditedRef = useRef(false)

    // All three lookup datasets are loaded via TanStack Query.
    // Cleanup, AbortSignal cancellation on unmount, and cross-mount caching are
    // handled inside the hook — no useEffect needed here.
    const {
        parentCategories: categories,
        childCategories: subCategories,
        unitsOfMeasure: units,
        bulkVariationOptions,
        loading: loadingLookups,
    } = useProductFormLookups()
    const loadingCategories = loadingLookups
    const loadingUnits = loadingLookups
    const loadingBulkVariations = loadingLookups

    const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({})
    const [originalVariationOptions, setOriginalVariationOptions] = useState<any[]>([])

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: "",
            code: "",
            price: 0,
            initialStock: 0,
            categoryId: 0,
            subCategoryId: undefined,
            unitOfMeasureId: undefined,
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

    // Lookup data (categories, units, variation options) is now sourced from
    // useProductFormLookups() above. The 3 ad-hoc useEffect fetches that used to
    // live here have been replaced with cached, abortable TanStack Query calls.

    // Load initialData into form when editing
    useEffect(() => {
        if (isEdit && initialData) {
            // Reset form with initial data
            const formData: any = {
                title: initialData.title || "",
                code: initialData.code || "",
                price: initialData.price || 0,
                // Stock quantity no longer lives on Product; edit via stock adjustments page.
                initialStock: 0,
                categoryId: initialData.categoryId && initialData.categoryId > 0 ? initialData.categoryId : undefined,
                subCategoryId: initialData.subCategoryId && initialData.subCategoryId > 0 ? initialData.subCategoryId : undefined,
                unitOfMeasureId: initialData.unitOfMeasureId && initialData.unitOfMeasureId > 0 ? initialData.unitOfMeasureId : undefined,
                imageUrl: initialData.imageUrl ? [initialData.imageUrl] : [],
                // Primary image for compact uploader
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
                    const valueToKey = buildValueToVariationKeyMap(formVariationOptions)
                    formData.productVariants = initialData.productVariants.map((variant: any) => ({
                        sku: variant.sku || "",
                        price: variant.price || 0,
                        // Stock is not editable via product update; shown as availableQuantity for reference only.
                        initialStock: 0,
                        isActive: variant.isActive ?? true,
                        variationValueKeys: (variant.variationValues ?? [])
                            .map((vv: any) => valueToKey.get((vv.value ?? "").trim()))
                            .filter((k: string | undefined): k is string => typeof k === "string" && k.length > 0),
                    }))
                }
            }

            // Reset form with all data
            form.reset(formData)

            galleryDirtyRef.current = false
            const imgs = initialData.images as
                | Array<{ id?: number; url?: string; isThumbnail?: boolean }>
                | undefined
            if (imgs && Array.isArray(imgs) && imgs.length > 0) {
                const slots: GallerySlot[] = imgs.map((im) => ({
                    key: newGalleryKey(),
                    url: im.url,
                    preview: im.url ?? null,
                    serverId: typeof im.id === "number" && im.id > 0 ? im.id : undefined,
                }))
                setGallerySlots(slots)
                const ti = imgs.findIndex((im) => im.isThumbnail)
                const thumbIdx = ti >= 0 ? ti : 0
                setThumbnailKey(slots[thumbIdx]?.key ?? slots[0]?.key ?? null)
            } else if (initialData.imageUrl) {
                const k = newGalleryKey()
                setGallerySlots([
                    {
                        key: k,
                        url: initialData.imageUrl,
                        preview: initialData.imageUrl,
                    },
                ])
                setThumbnailKey(k)
            } else {
                setGallerySlots([])
                setThumbnailKey(null)
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

    const addGalleryFiles = (files: FileList | null) => {
        if (!files?.length) return
        const next: GallerySlot[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (!file.type.startsWith("image/")) continue
            if (file.size > 2 * 1024 * 1024) {
                toast.error(`${file.name} must be under 2MB`)
                continue
            }
            const key = newGalleryKey()
            next.push({ key, file, preview: URL.createObjectURL(file) })
        }
        if (next.length === 0) return
        galleryDirtyRef.current = true
        setGallerySlots((prev) => {
            const merged = [...prev, ...next]
            setThumbnailKey((tk) => tk ?? next[0]!.key)
            return merged
        })
    }

    const removeGallerySlot = (key: string) => {
        galleryDirtyRef.current = true
        setGallerySlots((prev) => {
            const slot = prev.find((s) => s.key === key)
            if (slot?.preview?.startsWith("blob:")) URL.revokeObjectURL(slot.preview)
            const next = prev.filter((s) => s.key !== key)
            setThumbnailKey((tk) => {
                if (tk !== key) return tk
                return next[0]?.key ?? null
            })
            return next
        })
    }

    // Generate all possible variant combinations from variation options
    const generateVariants = useCallback(() => {
        const options = form.getValues("variationOptions") || []
        if (options.length === 0) {
            form.setValue("productVariants", [])
            return
        }

        const combinations = cartesianVariationKeys(options)
        const existingVariants = form.getValues("productVariants") || []
        const baseCode = form.getValues("code") || "PROD"
        const basePrice = form.getValues("price") || 0

        const sameKeySet = (a: string[], b: string[]) =>
            JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())

        const newVariants: ProductVariantFormValues[] = combinations.map((keys, idx) => {
            const existing = existingVariants.find((v) => sameKeySet(v.variationValueKeys, keys))
            const base = (baseCode || "ITEM").replace(/[^A-Za-z0-9]/g, "")
            const suffix = variantLetterSuffix(idx)
            return (
                existing ?? {
                    sku: `${base}${suffix}`,
                    price: basePrice,
                    initialStock: 0,
                    isActive: true,
                    variationValueKeys: keys,
                }
            )
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

    const onSubmit = (data: ProductFormValues) => {
        const slots = gallerySlots.filter((s) => s.file || s.url)
        const thumbKeyResolved = thumbnailKey ?? slots[0]?.key ?? null
        const primarySlot = thumbKeyResolved ? slots.find((s) => s.key === thumbKeyResolved) : slots[0]

        const submitData: any = {
            ...data,
            imageUrl:
                primarySlot?.url ??
                (typeof data.imageUrl === "string" ? data.imageUrl : undefined) ??
                (isEdit ? initialData?.imageUrl : undefined),
        }

        if (!isEdit) {
            if (slots.length > 0) {
                submitData.imageSlots = slots.map((s) => ({
                    url: s.file ? undefined : s.url,
                    file: s.file,
                    isThumbnail: s.key === thumbKeyResolved,
                }))
            }
        } else {
            const hasServerIds = slots.some((s) => s.serverId != null)
            if (!galleryDirtyRef.current && hasServerIds && slots.length > 0) {
                submitData.productImageThumbnailUpdates = slots
                    .filter((s) => s.serverId != null)
                    .map((s) => ({
                        id: s.serverId!,
                        isThumbnail: s.key === thumbKeyResolved,
                    }))
            } else {
                if (slots.length === 0) {
                    submitData.clearGallery = true
                    submitData.imageUrl = undefined
                } else {
                    submitData.imageSlots = slots.map((s) => ({
                        url: s.file ? undefined : s.url,
                        file: s.file,
                        isThumbnail: s.key === thumbKeyResolved,
                    }))
                }
            }
        }

        // If product has variations, ensure variation data is included
        if (data.hasVariations) {
            submitData.hasVariations = true
            submitData.variationOptions = (data.variationOptions || []).filter((opt: any) => opt.name && opt.values && opt.values.length > 0)
            submitData.productVariants = (data.productVariants || []).filter((v: any) => v.sku && v.variationValueKeys && v.variationValueKeys.length > 0)

            // Validate that we have valid variation data
            if (submitData.variationOptions.length === 0 || submitData.productVariants.length === 0) {
                toast.error("Please add at least one variation option with values and ensure variants are generated")
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

        const onSuccess = () => {
            router.push("/inventory/products")
            router.refresh()
        }
        const onError = (error: unknown) => {
            console.error(error)
            if (!applyValidationErrors(error, form.setError)) {
                const message =
                    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    (error as Error)?.message ||
                    (isEdit ? "Failed to update product" : "Failed to create product")
                toast.error(message)
            }
        }

        if (isEdit && initialData?.id) {
            updateProduct.mutate({ id: initialData.id, data: submitData }, { onSuccess, onError })
        } else {
            createProduct.mutate(submitData, { onSuccess, onError })
        }
    }

    const onSave = async () => {
        const isValid = await form.trigger()
        if (!isValid) {
            toast.error("Please fix form errors before saving")
            return
        }
        const data = form.getValues()
        onSubmit(data)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8 hover:bg-muted/50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">{isEdit ? "Edit Product" : "Create Product"}</h1>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        disabled={isLoading}
                        className="h-8"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={onSave}
                        disabled={isLoading}
                        className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 xl:items-start">
                        {/* Left ~50%: product + price & category */}
                        <div className="min-w-0 max-w-full space-y-3 overflow-hidden">
                            <Card className="min-w-0 max-w-full overflow-hidden border border-border/50 shadow-none">
                                <CardHeader className="py-2 px-3 border-b border-border/50">
                                    <CardTitle className="text-sm font-semibold">Product</CardTitle>
                                </CardHeader>
                                <CardContent className="min-w-0 max-w-full space-y-3 p-3">
                                    {/* Stack vertically so images row never fights name/code for width (fixes overlap). */}
                                    <div className="flex min-w-0 max-w-full flex-col gap-3">
                                        <div className="min-w-0 max-w-full space-y-1.5">
                                            <FormLabel className="text-xs font-medium">Images</FormLabel>
                                            {gallerySlots.length === 0 ? (
                                                <div className="flex min-h-14 w-full min-w-0 items-center rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
                                                    No images yet. Use the &quot;Add images&quot; button below.
                                                </div>
                                            ) : (
                                                <div className="min-w-0 max-w-full rounded-lg border border-border/50 bg-muted/15 p-2.5 sm:p-3">
                                                    <div className="flex min-h-[5.25rem] w-full min-w-0 flex-nowrap items-center gap-3 overflow-x-auto overflow-y-hidden py-1 sm:min-h-[5.75rem] sm:gap-4">
                                                        {gallerySlots.map((slot) => (
                                                            <div key={slot.key} className="shrink-0">
                                                                <ContextMenu>
                                                                    <ContextMenuTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            className={`relative flex size-16 shrink-0 items-center justify-center rounded-lg border bg-muted p-1.5 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-[4.75rem] sm:p-2 ${
                                                                                thumbnailKey === slot.key
                                                                                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background border-primary"
                                                                                    : "border-border/60 hover:border-border"
                                                                            }`}
                                                                            aria-label="Product image, open menu for options"
                                                                        >
                                                                            {slot.preview ? (
                                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                                <img
                                                                                    src={slot.preview}
                                                                                    alt=""
                                                                                    className="max-h-full max-w-full rounded-md object-contain pointer-events-none"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex size-full min-h-0 min-w-0 items-center justify-center pointer-events-none">
                                                                                    <Package className="h-6 w-6 text-muted-foreground/40 sm:h-7 sm:w-7" />
                                                                                </div>
                                                                            )}
                                                                            {thumbnailKey === slot.key ? (
                                                                                <span className="absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm pointer-events-none sm:h-5 sm:w-5">
                                                                                    <Star className="h-2.5 w-2.5 fill-current sm:h-3 sm:w-3" />
                                                                                </span>
                                                                            ) : null}
                                                                        </button>
                                                                    </ContextMenuTrigger>
                                                                    <ContextMenuContent>
                                                                        <ContextMenuItem
                                                                            onSelect={() =>
                                                                                setThumbnailKey(slot.key)
                                                                            }
                                                                        >
                                                                            Set thumbnail
                                                                        </ContextMenuItem>
                                                                        <ContextMenuSeparator />
                                                                        <ContextMenuItem
                                                                            variant="destructive"
                                                                            onSelect={() =>
                                                                                removeGallerySlot(slot.key)
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </ContextMenuItem>
                                                                    </ContextMenuContent>
                                                                </ContextMenu>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                id="product-gallery-upload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => {
                                                    addGalleryFiles(e.target.files)
                                                    e.target.value = ""
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-[11px]"
                                                onClick={() =>
                                                    document.getElementById("product-gallery-upload")?.click()
                                                }
                                            >
                                                <Upload className="h-3 w-3 mr-1 shrink-0" />
                                                Add images
                                            </Button>
                                            <p className="text-[10px] text-muted-foreground leading-tight">
                                                JPG, PNG · max 2MB each · right-click an image to set thumbnail or
                                                delete
                                            </p>
                                        </div>
                                        <div className="min-w-0 max-w-full space-y-2">
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium">Name *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Product name"
                                                                {...field}
                                                                className="h-8 text-sm"
                                                                onBlur={(e) => {
                                                                    field.onBlur()
                                                                    if (!isEdit && !codeManuallyEditedRef.current) {
                                                                        const t = e.target.value.trim()
                                                                        if (t)
                                                                            form.setValue(
                                                                                "code",
                                                                                codeFromTitle(t),
                                                                                { shouldValidate: true }
                                                                            )
                                                                    }
                                                                }}
                                                            />
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
                                                        <FormLabel className="text-xs font-medium">Code *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Letters and numbers only"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    codeManuallyEditedRef.current = true
                                                                    const value = e.target.value.replace(
                                                                        /[^A-Za-z0-9]/g,
                                                                        ""
                                                                    )
                                                                    field.onChange(value)
                                                                }}
                                                                className="h-8 text-sm"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-[11px]">
                                                            Filled from name until you edit it manually.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="metadata.description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Short description…"
                                                        className="resize-none min-h-[52px] text-sm"
                                                        rows={2}
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border border-border/50 shadow-none">
                                <CardHeader className="py-2 px-3 border-b border-border/50">
                                    <CardTitle className="text-sm font-semibold">Price & category</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 space-y-2.5">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium">
                                                    {hasVariations ? "Base price" : "Price *"}
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
                                                        className="h-8 text-sm"
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
                                                <FormLabel className="text-xs font-medium">Category *</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={categories.map((cat) => ({
                                                            value: String(cat.id),
                                                            label: cat.title,
                                                        }))}
                                                        value={
                                                            field.value && field.value > 0
                                                                ? String(field.value)
                                                                : undefined
                                                        }
                                                        onValueChange={(value) => {
                                                            const numValue = value ? Number(value) : undefined
                                                            field.onChange(
                                                                numValue && numValue > 0 ? numValue : undefined
                                                            )
                                                            form.setValue("subCategoryId", undefined)
                                                        }}
                                                        placeholder="Category"
                                                        searchPlaceholder="Search…"
                                                        emptyMessage="None"
                                                        disabled={loadingCategories}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {selectedCategoryId > 0 && (
                                        <FormField
                                            control={form.control}
                                            name="subCategoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium">Subcategory</FormLabel>
                                                    <FormControl>
                                                        <Combobox
                                                            options={filteredSubCategories.map((cat) => ({
                                                                value: String(cat.id),
                                                                label: cat.title,
                                                            }))}
                                                            value={
                                                                field.value && field.value > 0
                                                                    ? String(field.value)
                                                                    : undefined
                                                            }
                                                            onValueChange={(value) => {
                                                                const numValue = value ? Number(value) : undefined
                                                                field.onChange(
                                                                    numValue && numValue > 0 ? numValue : undefined
                                                                )
                                                            }}
                                                            placeholder="Subcategory"
                                                            searchPlaceholder="Search…"
                                                            emptyMessage="None"
                                                            disabled={
                                                                loadingCategories ||
                                                                filteredSubCategories.length === 0
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="unitOfMeasureId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium">Unit of Measure</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={units
                                                            .filter((u) => u.isActive)
                                                            .map((unit) => ({
                                                                value: String(unit.id),
                                                                label: `${unit.title ?? unit.name} (${unit.abbreviation})`,
                                                            }))}
                                                        value={
                                                            field.value && field.value > 0
                                                                ? String(field.value)
                                                                : undefined
                                                        }
                                                        onValueChange={(value) => {
                                                            const numValue = value ? Number(value) : undefined
                                                            field.onChange(
                                                                numValue && numValue > 0 ? numValue : undefined
                                                            )
                                                        }}
                                                        placeholder="Unit of measure"
                                                        searchPlaceholder="Search…"
                                                        emptyMessage="None"
                                                        disabled={loadingUnits}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right ~50%: variations */}
                        <div className="min-w-0 max-w-full space-y-3 xl:sticky xl:top-4 xl:max-h-[calc(100dvh-5.5rem)] xl:overflow-y-auto xl:pr-0.5">
                            {/* Variations Toggle */}
                            <Card className="min-w-0 max-w-full border border-border/50 shadow-none">
                                <CardHeader className="py-2 px-3 border-b border-border/50">
                                    <CardTitle className="text-sm font-semibold">Variations</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <FormField
                                        control={form.control}
                                        name="hasVariations"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between gap-2 rounded-md border border-border/50 bg-muted/25 px-2.5 py-2">
                                                <div className="min-w-0 pr-2 flex-1">
                                                    <FormLabel className="text-xs font-medium cursor-pointer leading-tight">
                                                        Enable variations
                                                    </FormLabel>
                                                    <FormDescription className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                                                        {isEdit ? "Variations cannot be edited after product creation" : "Add variation options like Size, Color, or Material to create multiple product variants. "}
                                                        {!isEdit && (
                                                            <>
                                                                <Link href="/inventory/variations?returnTo=/inventory/products/create" className="text-primary underline underline-offset-2 hover:no-underline">
                                                                    Manage variation options
                                                                </Link>
                                                            </>
                                                        )}
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
                                    <Card className="border border-border/50 shadow-none">
                                        <CardHeader className="py-2 px-3 border-b border-border/50">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <CardTitle className="text-sm font-semibold">Options & values</CardTitle>
                                                {!isEdit && (
                                                    <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                                        <Link href="/inventory/variations?returnTo=/inventory/products/create">
                                                            Manage catalog
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            <div className="space-y-2.5">
                                                {variationOptionsFields.fields.map((field, optionIndex) => {
                                                    const currentValues = form.watch(`variationOptions.${optionIndex}.values`) || []
                                                    const newValue = newValueInputs[optionIndex] || ""

                                                    return (
                                                        <div
                                                            key={field.id}
                                                            className="flex flex-col gap-2 border-b border-border/40 pb-2.5 last:border-b-0 last:pb-0"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`variationOptions.${optionIndex}.name`}
                                                                    render={({ field }) => {
                                                                        const isCustomOption = field.value && !bulkVariationOptions.some(opt => opt.name === field.value)
                                                                        return (
                                                                            <FormItem className="min-w-0 flex-1">
                                                                                <FormControl>
                                                                                    {!isEdit ? (
                                                                                        <div className="flex gap-1">
                                                                                            <Select
                                                                                                value={isCustomOption ? "__new_option__" : (field.value || undefined)}
                                                                                                onValueChange={(value) => {
                                                                                                    if (value === "__new_option__") {
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
                                                                                                    <SelectItem value="__new_option__">-- New Option --</SelectItem>
                                                                                                    {bulkVariationOptions && bulkVariationOptions.length > 0 ? (
                                                                                                        bulkVariationOptions.map((opt) => (
                                                                                                            <SelectItem key={opt.name} value={opt.name}>
                                                                                                                {opt.name}
                                                                                                            </SelectItem>
                                                                                                        ))
                                                                                                    ) : (
                                                                                                        <SelectItem value="__no_options__" disabled>
                                                                                                            No options available. Type to create custom.
                                                                                                        </SelectItem>
                                                                                                    )}
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                            {(isCustomOption || field.value === "") && (
                                                                                                <Input

                                                                                                    {...field}
                                                                                                    value={field.value || ""}
                                                                                                    onChange={(e) => {
                                                                                                        field.onChange(e.target.value)
                                                                                                        if (!e.target.value) {
                                                                                                            form.setValue(`variationOptions.${optionIndex}.values`, [])
                                                                                                        }
                                                                                                    }}
                                                                                                    className="h-8 text-sm border-2 w-28"
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
                                                                {variationOptionsFields.fields.length > 1 && !isEdit && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => {
                                                                            variationOptionsFields.remove(optionIndex)
                                                                            setNewValueInputs((prev) => {
                                                                                const updated = { ...prev }
                                                                                delete updated[optionIndex]
                                                                                const reindexed: Record<number, string> = {}
                                                                                Object.keys(updated).forEach((key) => {
                                                                                    const idx = parseInt(key, 10)
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
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {/* Values */}
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
                                                                {/* {!isEdit && selectedOptionName && (
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
                                                                )} */}
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
                                                    className="w-full border-dashed mt-3 h-9 hover:bg-muted/50 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Variation Option
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Product Variants Table */}
                                    {productVariantsFields.fields.length > 0 && (
                                        <Card className="border border-border/50 shadow-none">
                                            <CardHeader className="py-2 px-3 border-b border-border/50">
                                                <CardTitle className="text-sm font-semibold">Variants</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-2">
                                                <div className="rounded-md border border-border/50 overflow-x-auto">
                                                    <Table className="text-xs">
                                                        <TableHeader>
                                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                                <TableHead className="h-8 py-1 font-medium">Combo</TableHead>
                                                                <TableHead className="h-8 py-1 font-medium">SKU</TableHead>
                                                                <TableHead className="h-8 py-1 font-medium">Price</TableHead>
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
                                                                    <TableRow key={field.id} className="h-8">
                                                                        <TableCell className="py-1.5 font-medium max-w-[140px] truncate">
                                                                            {combination}
                                                                        </TableCell>
                                                                        <TableCell className="py-1.5">
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`productVariants.${variantIndex}.sku`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                {...field}
                                                                                                className="h-7 w-[7rem] text-xs"
                                                                                                onChange={(e) => {
                                                                                                    const value = e.target.value.replace(/[^A-Za-z0-9]/g, "")
                                                                                                    field.onChange(value)
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell className="py-1.5">
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
                                                                                                className="h-7 w-[5.5rem] text-xs"
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
                    </div>
                </form>
            </Form>
        </div>
    )
}
