"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { moduleAPI, CreateModuleRequest } from "@/lib/api/module"
import { Module, ModuleType } from "@/types/module"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { IconPicker, type IconName } from "@/components/ui/icon-picker"

const moduleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    icon: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    parentId: z.number().optional().nullable(),
    type: z.number().min(1).max(2),
    description: z.string().optional().nullable(),
    version: z.string().optional().nullable(),
    isInstalled: z.boolean().default(false),
    isEnabled: z.boolean().default(false),
    order: z.coerce.number().int().min(0),
    isActive: z.boolean().default(true),
    isExternal: z.boolean().default(false),
    metadata: z.object({
        roles: z.array(z.string()).optional(),
        badgeText: z.string().optional().nullable(),
        badgeColor: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        openInNewTab: z.boolean().default(false),
        author: z.string().optional().nullable(),
        website: z.string().optional().nullable(),
        dependencies: z.array(z.string()).optional(),
        configurationUrl: z.string().optional().nullable(),
    }).optional(),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

interface ModuleFormProps {
    moduleId?: number
}

export function ModuleForm({ moduleId }: ModuleFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(!!moduleId)
    const [parentModules, setParentModules] = useState<Module[]>([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            title: "",
            icon: null,
            url: null,
            parentId: null,
            type: ModuleType.Module,
            description: null,
            version: null,
            isInstalled: false,
            isEnabled: false,
            order: 0,
            isActive: true,
            isExternal: false,
            metadata: {
                roles: [],
                badgeText: null,
                badgeColor: null,
                description: null,
                openInNewTab: false,
                author: null,
                website: null,
                dependencies: [],
                configurationUrl: null,
            },
        },
    })

    const moduleType = watch("type")
    const parentId = watch("parentId")

    // Fetch parent modules (only Module type, not Link)
    useEffect(() => {
        const fetchParents = async () => {
            try {
                const modules = await moduleAPI.getModulesByType(ModuleType.Module)
                setParentModules(modules)
            } catch (error) {
                console.error("Failed to fetch parent modules:", error)
            }
        }
        fetchParents()
    }, [])

    // Fetch module data if editing
    useEffect(() => {
        if (moduleId) {
            const fetchModule = async () => {
                setFetching(true)
                try {
                    const module = await moduleAPI.getModuleById(moduleId)
                    setValue("title", module.title)
                    setValue("icon", module.icon || null)
                    setValue("url", module.url || null)
                    setValue("parentId", module.parentId || null)
                    setValue("type", module.type)
                    setValue("description", module.description || null)
                    setValue("version", module.version || null)
                    setValue("isInstalled", module.isInstalled)
                    setValue("isEnabled", module.isEnabled)
                    setValue("order", module.order)
                    setValue("isActive", module.isActive)
                    setValue("isExternal", module.isExternal)
                    setValue("metadata", module.metadata || {
                        roles: [],
                        badgeText: null,
                        badgeColor: null,
                        description: null,
                        openInNewTab: false,
                        author: null,
                        website: null,
                        dependencies: [],
                        configurationUrl: null,
                    })
                } catch (error) {
                    console.error("Failed to fetch module:", error)
                    toast.error("Failed to load module data")
                } finally {
                    setFetching(false)
                }
            }
            fetchModule()
        }
    }, [moduleId, setValue])

    // Reset parentId when type changes to Module
    useEffect(() => {
        if (moduleType === ModuleType.Module) {
            setValue("parentId", null)
        }
    }, [moduleType, setValue])

    const onSubmit = async (data: ModuleFormValues) => {
        setLoading(true)
        try {
            const payload: CreateModuleRequest = {
                ...data,
                // Ensure parentId is null for Module type
                parentId: moduleType === ModuleType.Module ? null : data.parentId,
            }

            if (moduleId) {
                await moduleAPI.updateModule(moduleId, payload)
                toast.success("Module updated successfully")
            } else {
                await moduleAPI.createModule(payload)
                toast.success("Module created successfully")
            }
            router.push("/settings/modules")
        } catch (error) {
            console.error("Failed to save module:", error)
            toast.error("Failed to save module")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <CardDescription className="text-sm">
                        Enter the basic details for this module
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            {...register("title")}
                            placeholder="e.g., Inventory, Sales"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                value={moduleType.toString()}
                                onValueChange={(value) => setValue("type", Number(value))}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ModuleType.Module.toString()}>
                                        Module (Parent)
                                    </SelectItem>
                                    <SelectItem value={ModuleType.Link.toString()}>
                                        Link (Submodule)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-destructive">{errors.type.message}</p>
                            )}
                        </div>

                        {moduleType === ModuleType.Link && (
                            <div className="space-y-2">
                                <Label htmlFor="parentId">Parent Module *</Label>
                                <Select
                                    value={parentId?.toString() || ""}
                                    onValueChange={(value) =>
                                        setValue("parentId", value ? Number(value) : null)
                                    }
                                >
                                    <SelectTrigger id="parentId">
                                        <SelectValue placeholder="Select a parent module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parentModules.map((module) => (
                                            <SelectItem key={module.id} value={module.id.toString()}>
                                                {module.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.parentId && (
                                    <p className="text-sm text-destructive">
                                        {errors.parentId.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="icon">Icon</Label>
                            <IconPicker
                                value={(watch("icon") as IconName) || undefined}
                                onValueChange={(value) => setValue("icon", value || null)}
                                triggerPlaceholder="Select an icon"
                            />
                            {errors.icon && (
                                <p className="text-sm text-destructive">{errors.icon.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                {...register("url")}
                                placeholder="e.g., /inventory, /sales"
                            />
                            {errors.url && (
                                <p className="text-sm text-destructive">{errors.url.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Module description"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="order">Order</Label>
                            <Input
                                id="order"
                                type="number"
                                {...register("order")}
                                placeholder="0"
                            />
                            {errors.order && (
                                <p className="text-sm text-destructive">{errors.order.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="version">Version</Label>
                            <Input
                                id="version"
                                {...register("version")}
                                placeholder="e.g., 1.0.0"
                            />
                            {errors.version && (
                                <p className="text-sm text-destructive">
                                    {errors.version.message}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Configure module behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="isActive">Active</Label>
                            <p className="text-sm text-muted-foreground">
                                Whether this module is currently active
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={watch("isActive")}
                            onCheckedChange={(checked) => setValue("isActive", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="isExternal">External Link</Label>
                            <p className="text-sm text-muted-foreground">
                                Open this link in a new tab
                            </p>
                        </div>
                        <Switch
                            id="isExternal"
                            checked={watch("isExternal")}
                            onCheckedChange={(checked) => setValue("isExternal", checked)}
                        />
                    </div>

                    {moduleType === ModuleType.Module && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isInstalled">Installed</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Whether this module is installed
                                    </p>
                                </div>
                                <Switch
                                    id="isInstalled"
                                    checked={watch("isInstalled")}
                                    onCheckedChange={(checked) =>
                                        setValue("isInstalled", checked)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isEnabled">Enabled</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Whether this module is enabled
                                    </p>
                                </div>
                                <Switch
                                    id="isEnabled"
                                    checked={watch("isEnabled")}
                                    onCheckedChange={(checked) => setValue("isEnabled", checked)}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {moduleId ? "Update Module" : "Create Module"}
                </Button>
            </div>
        </form>
    )
}

