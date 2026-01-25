"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const funnelData = [
    { stage: "Visitors", count: 10000, percentage: 100 },
    { stage: "Leads", count: 2500, percentage: 25 },
    { stage: "Opportunities", count: 1200, percentage: 12 },
    { stage: "Customers", count: 450, percentage: 4.5 },
]

export function ConversionFunnel() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Sales pipeline overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {funnelData.map((item, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.stage}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{item.count.toLocaleString()}</span>
                                <span className="font-semibold">{item.percentage}%</span>
                            </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

