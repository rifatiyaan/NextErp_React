"use client"

import { useEffect, useState } from "react"
import { moduleAPI } from "@/lib/api/module"
import { Module, ModuleType } from "@/types/module"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ModulesPage() {
    const [data, setData] = useState<Module[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const modules = await moduleAPI.getAllModules()
            setData(modules)
        } catch (error) {
            console.error("Failed to fetch modules:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manage Modules</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage modules and submodules for your application
                    </p>
                </div>
                <Button asChild size="sm">
                    <Link href="/settings/modules/create">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Create Module
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.filter((m) => m.type === ModuleType.Module).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Parent modules</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.filter((m) => m.type === ModuleType.Link).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Submodules/Links</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.filter((m) => m.isActive).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <DataTable columns={columns} data={data} onRefresh={fetchData} />
            )}
        </div>
    )
}

