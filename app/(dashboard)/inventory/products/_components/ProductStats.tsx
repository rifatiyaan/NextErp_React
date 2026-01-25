"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
    {
        title: "Total Sales",
        value: "$30,230",
        change: "+20.1%",
        changeType: "positive" as const,
        icon: DollarSign,
    },
    {
        title: "Number of Sales",
        value: "982",
        change: "+5.02",
        changeType: "positive" as const,
        icon: ShoppingCart,
    },
    {
        title: "Affiliate",
        value: "$4,530",
        change: "+3.1%",
        changeType: "positive" as const,
        icon: Users,
    },
    {
        title: "Discounts",
        value: "$2,230",
        change: "-3.58%",
        changeType: "negative" as const,
        icon: TrendingDown,
    },
]

export function ProductStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        stat.changeType === "positive" &&
                                            "text-green-600 dark:text-green-400",
                                        stat.changeType === "negative" && "text-destructive"
                                    )}
                                >
                                    {stat.change}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

