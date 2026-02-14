"use client"

import { ModuleForm } from "../_components/module-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateModulePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings/modules">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Module</h1>
                    <p className="text-muted-foreground">
                        Create a new module or submodule for your application
                    </p>
                </div>
            </div>

            <ModuleForm />
        </div>
    )
}

