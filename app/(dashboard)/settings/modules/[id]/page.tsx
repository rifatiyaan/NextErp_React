"use client"

import { use } from "react"
import { ModuleForm } from "../_components/module-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function EditModulePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const moduleId = parseInt(id, 10)

    if (isNaN(moduleId)) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/settings/modules">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Module</h1>
                    </div>
                </div>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Invalid module ID</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings/modules">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Module</h1>
                    <p className="text-muted-foreground">
                        Update module or submodule details
                    </p>
                </div>
            </div>

            <ModuleForm moduleId={moduleId} />
        </div>
    )
}

