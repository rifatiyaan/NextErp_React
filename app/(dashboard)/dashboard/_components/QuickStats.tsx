"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
    { label: "Conversion Rate", value: "3.2%", change: "+0.5%", trend: "up" },
    { label: "Avg Order Value", value: "$125.50", change: "+$12.30", trend: "up" },
    { label: "Customer Retention", value: "78%", change: "-2%", trend: "down" },
    { label: "Return Rate", value: "2.1%", change: "0%", trend: "neutral" },
]

export function QuickStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="p-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <div
                                    className={cn(
                                        "flex items-center gap-1 text-sm font-medium",
                                        stat.trend === "up" && "text-green-600 dark:text-green-400",
                                        stat.trend === "down" && "text-destructive",
                                        stat.trend === "neutral" && "text-muted-foreground"
                                    )}
                                >
                                    {stat.trend === "up" && <TrendingUp className="h-4 w-4" />}
                                    {stat.trend === "down" && <TrendingDown className="h-4 w-4" />}
                                    {stat.trend === "neutral" && <Minus className="h-4 w-4" />}
                                    <span>{stat.change}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

