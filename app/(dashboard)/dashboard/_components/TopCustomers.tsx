"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const customers = [
    { name: "John Doe", email: "john@example.com", orders: 45, total: 12500, status: "active" },
    { name: "Jane Smith", email: "jane@example.com", orders: 38, total: 9800, status: "active" },
    { name: "Bob Johnson", email: "bob@example.com", orders: 32, total: 8500, status: "active" },
    { name: "Alice Williams", email: "alice@example.com", orders: 28, total: 7200, status: "active" },
    { name: "Charlie Brown", email: "charlie@example.com", orders: 25, total: 6500, status: "vip" },
]

export function TopCustomers() {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Most valuable customers this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {customers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{customer.name}</p>
                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold">${customer.total.toLocaleString()}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                                {customer.status === "vip" && (
                                    <Badge variant="secondary" className="text-xs">
                                        VIP
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

