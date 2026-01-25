"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

const data = [
    { day: "Mon", sales: 4500, target: 5000 },
    { day: "Tue", sales: 5200, target: 5000 },
    { day: "Wed", sales: 4800, target: 5000 },
    { day: "Thu", sales: 6100, target: 5000 },
    { day: "Fri", sales: 5500, target: 5000 },
    { day: "Sat", sales: 6700, target: 6000 },
    { day: "Sun", sales: 7200, target: 6000 },
]

export function SalesChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Sales</CardTitle>
                <CardDescription>Sales performance vs target</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="day"
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                        />
                        <Bar
                            dataKey="sales"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="target"
                            fill="hsl(var(--muted))"
                            radius={[4, 4, 0, 0]}
                            opacity={0.3}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

