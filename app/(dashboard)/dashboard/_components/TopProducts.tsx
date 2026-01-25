"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const products = [
    { name: "Product A", sales: 1250, revenue: 125000, target: 150000 },
    { name: "Product B", sales: 980, revenue: 98000, target: 120000 },
    { name: "Product C", sales: 750, revenue: 75000, target: 100000 },
    { name: "Product D", sales: 620, revenue: 62000, target: 80000 },
    { name: "Product E", sales: 450, revenue: 45000, target: 60000 },
]

export function TopProducts() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {products.map((product, index) => {
                    const percentage = (product.revenue / product.target) * 100
                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{product.name}</span>
                                <span className="text-muted-foreground">
                                    ${product.revenue.toLocaleString()}
                                </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{product.sales} sales</span>
                                <span>{percentage.toFixed(0)}% of target</span>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

