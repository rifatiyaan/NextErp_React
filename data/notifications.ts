import type { NotificationType } from "@/types"

export const notificationData: NotificationType = {
    unreadCount: 2,
    notifications: [
        {
            id: "1",
            iconName: "Mail",
            content: "You have a new message.",
            url: "#",
            date: new Date(),
            isRead: false,
        },
        {
            id: "2",
            iconName: "UserPlus",
            content: "New user registered.",
            url: "#",
            date: new Date(Date.now() - 3600000), // 1 hour ago
            isRead: false,
        },
        {
            id: "3",
            iconName: "TriangleAlert",
            content: "Server alert: High CPU usage.",
            url: "#",
            date: new Date(Date.now() - 86400000), // 1 day ago
            isRead: true,
        },
    ],
}
