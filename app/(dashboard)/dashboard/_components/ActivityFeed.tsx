"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

const activities = [
    {
        user: "John Doe",
        action: "created a new order",
        target: "Order #1234",
        time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
        user: "Jane Smith",
        action: "updated product",
        target: "Product A",
        time: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
        user: "Bob Johnson",
        action: "completed payment",
        target: "$1,250.00",
        time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
        user: "Alice Williams",
        action: "added new customer",
        target: "Customer #567",
        time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
        user: "Charlie Brown",
        action: "updated inventory",
        target: "Stock Level",
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
]

export function ActivityFeed() {
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
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                                {getInitials(activity.user)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm">
                                <span className="font-medium">{activity.user}</span>{" "}
                                <span className="text-muted-foreground">{activity.action}</span>{" "}
                                <span className="font-medium">{activity.target}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(activity.time, { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

