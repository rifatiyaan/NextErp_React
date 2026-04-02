"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { branchAPI } from "@/lib/api/branch"
import type { Branch, BranchCreateRequest } from "@/lib/types/branch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader } from "@/components/ui/loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface BranchFormProps {
    branchId?: string
}

const EMPTY: BranchCreateRequest = {
    name: "",
    address: "",
    isActive: true,
    metadata: { phone: "", managerName: "", branchCode: "", email: "" },
}

export function BranchForm({ branchId }: BranchFormProps) {
    const router = useRouter()
    const isEdit = Boolean(branchId)

    const [form, setForm] = useState<BranchCreateRequest>(EMPTY)
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        if (!branchId) return
        try {
            const branch = await branchAPI.getBranchById(branchId)
            setForm({
                name: branch.name,
                address: branch.address ?? "",
                isActive: branch.isActive,
                metadata: {
                    phone: branch.metadata?.phone ?? "",
                    managerName: branch.metadata?.managerName ?? "",
                    branchCode: branch.metadata?.branchCode ?? "",
                    email: branch.metadata?.email ?? "",
                },
            })
        } catch {
            setError("Failed to load branch data")
        } finally {
            setLoading(false)
        }
    }, [branchId])

    useEffect(() => { void load() }, [load])

    function set(field: keyof BranchCreateRequest, value: unknown) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    function setMeta(field: string, value: string) {
        setForm((prev) => ({
            ...prev,
            metadata: { ...prev.metadata, [field]: value },
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            if (isEdit && branchId) {
                await branchAPI.updateBranch(branchId, { ...form, id: branchId })
            } else {
                await branchAPI.createBranch(form)
            }
            router.push("/settings/branches")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <Loader text="Loading branch..." />

    return (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Branch Name *</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                placeholder="e.g. Main Branch"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="branchCode">Branch Code</Label>
                            <Input
                                id="branchCode"
                                value={form.metadata?.branchCode ?? ""}
                                onChange={(e) => setMeta("branchCode", e.target.value)}
                                placeholder="e.g. BR-001"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={form.address ?? ""}
                            onChange={(e) => set("address", e.target.value)}
                            placeholder="Street, City, Country"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Switch
                            id="isActive"
                            checked={form.isActive ?? true}
                            onCheckedChange={(v) => set("isActive", v)}
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="managerName">Manager Name</Label>
                            <Input
                                id="managerName"
                                value={form.metadata?.managerName ?? ""}
                                onChange={(e) => setMeta("managerName", e.target.value)}
                                placeholder="Full name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={form.metadata?.phone ?? ""}
                                onChange={(e) => setMeta("phone", e.target.value)}
                                placeholder="+1 555 000 0000"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="metaEmail">Email</Label>
                            <Input
                                id="metaEmail"
                                type="email"
                                value={form.metadata?.email ?? ""}
                                onChange={(e) => setMeta("email", e.target.value)}
                                placeholder="branch@company.com"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <div className="flex gap-3">
                <Button type="submit" disabled={saving} size="sm">
                    {saving ? "Saving..." : isEdit ? "Update Branch" : "Create Branch"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/settings/branches")}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}
