"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string
    change: string
    changeType: "positive" | "negative" | "neutral"
    icon: LucideIcon
    description?: string
}

export function StatCard({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    description,
}: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
                <div className="mt-4 flex items-center">
                    <span
                        className={cn(
                            "text-sm font-medium",
                            changeType === "positive" && "text-green-600 dark:text-green-400",
                            changeType === "negative" && "text-destructive",
                            changeType === "neutral" && "text-muted-foreground"
                        )}
                    >
                        {change}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">vs last month</span>
                </div>
            </CardContent>
        </Card>
    )
}

