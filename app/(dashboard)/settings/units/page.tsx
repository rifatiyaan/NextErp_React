"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { unitOfMeasureAPI } from "@/lib/api/unit-of-measure"
import type { UnitOfMeasure } from "@/lib/types/unit-of-measure"

import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader } from "@/components/ui/loader"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const unitSchema = z.object({
    name: z.string().min(1, "Title is required"),
    abbreviation: z.string().min(1, "Abbreviation is required"),
    category: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

type UnitFormValues = z.infer<typeof unitSchema>

export default function UnitsSettingsPage() {
    const [rows, setRows] = useState<UnitOfMeasure[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<UnitOfMeasure | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<UnitOfMeasure | null>(null)
    const [deleting, setDeleting] = useState(false)

    const form = useForm<UnitFormValues>({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            name: "",
            abbreviation: "",
            category: "",
            isActive: true,
        },
    })

    const fetchRows = async () => {
        setLoading(true)
        try {
            const data = await unitOfMeasureAPI.getAll()
            setRows(data)
        } catch (error) {
            console.error("Failed to fetch units:", error)
            toast.error("Failed to load units of measure")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRows()
    }, [])

    const openCreate = () => {
        setEditing(null)
        form.reset({ name: "", abbreviation: "", category: "", isActive: true })
        setDialogOpen(true)
    }

    const openEdit = (row: UnitOfMeasure) => {
        setEditing(row)
        form.reset({
            name: row.title ?? row.name,
            abbreviation: row.abbreviation,
            category: row.category ?? "",
            isActive: row.isActive,
        })
        setDialogOpen(true)
    }

    const onSubmit = async (values: UnitFormValues) => {
        setSaving(true)
        try {
            const category = values.category?.trim() ? values.category.trim() : null
            if (editing) {
                await unitOfMeasureAPI.update(editing.id, {
                    name: values.name.trim(),
                    abbreviation: values.abbreviation.trim(),
                    category,
                    isActive: values.isActive,
                })
                toast.success("Unit updated")
            } else {
                await unitOfMeasureAPI.create({
                    name: values.name.trim(),
                    abbreviation: values.abbreviation.trim(),
                    category,
                })
                toast.success("Unit created")
            }
            setDialogOpen(false)
            setEditing(null)
            await fetchRows()
        } catch (error) {
            const message =
                (error as { message?: string })?.message ?? "Failed to save unit"
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        if (deleteTarget.isSystem) {
            toast.error("System units cannot be deleted")
            setDeleteTarget(null)
            return
        }
        setDeleting(true)
        try {
            await unitOfMeasureAPI.delete(deleteTarget.id)
            toast.success("Unit deleted")
            setDeleteTarget(null)
            await fetchRows()
        } catch (error) {
            const message =
                (error as { message?: string })?.message ?? "Failed to delete unit"
            toast.error(message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-3">
            <TopBar
                title="Units of Measure"
                actions={[
                    {
                        label: "Add New Unit",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: openCreate,
                        variant: "default",
                        size: "sm",
                    },
                ]}
            />

            {loading ? (
                <Loader text="Loading units..." />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Abbreviation</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>System</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No units of measure
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">
                                            {row.title ?? row.name}
                                        </TableCell>
                                        <TableCell className="font-mono text-[11px]">
                                            {row.abbreviation}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {row.category ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={row.isSystem ? "secondary" : "outline"}>
                                                {row.isSystem ? "Yes" : "No"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={row.isActive ? "default" : "outline"}>
                                                {row.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => openEdit(row)}
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                                    disabled={row.isSystem}
                                                    title={
                                                        row.isSystem
                                                            ? "System units cannot be deleted"
                                                            : "Delete"
                                                    }
                                                    onClick={() => setDeleteTarget(row)}
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) setEditing(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Unit" : "Add New Unit"}</DialogTitle>
                        <DialogDescription>
                            {editing
                                ? "Update unit of measure details."
                                : "Create a new unit of measure."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-3"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Kilogram" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="abbreviation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Abbreviation *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. kg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Length, Weight, Volume, Count"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {editing && (
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active</FormLabel>
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
                            )}
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : editing ? "Save" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteTarget != null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete unit?</DialogTitle>
                        <DialogDescription>
                            {deleteTarget
                                ? `This will deactivate "${deleteTarget.title ?? deleteTarget.name}". This action cannot be undone.`
                                : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting || (deleteTarget?.isSystem ?? false)}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
