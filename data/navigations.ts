import type { NavigationType } from "@/types"

export const navigationsData: NavigationType[] = [
    {
        title: "Dashboards",
        items: [
            {
                title: "Analytics",
                href: "/dashboards/analytics",
                iconName: "ChartPie",
            },
            {
                title: "CRM",
                href: "/dashboards/crm",
                iconName: "ChartBar",
            },
            {
                title: "eCommerce",
                href: "/dashboards/ecommerce",
                iconName: "ShoppingCart",
            },
        ],
    },
    {
        title: "Pages",
        items: [
            {
                title: "Landing",
                href: "/pages/landing",
                label: "New",
                iconName: "LayoutTemplate",
            },
            {
                title: "Pricing",
                href: "/pages/pricing",
                iconName: "CircleDollarSign",
            },
        ],
    },
]
