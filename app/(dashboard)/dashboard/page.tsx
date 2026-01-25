"use client"

import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { StatCard } from "./_components/StatCard"
import { RevenueChart } from "./_components/RevenueChart"
import { SalesChart } from "./_components/SalesChart"
import { RecentTransactions } from "./_components/RecentTransactions"
import { TopProducts } from "./_components/TopProducts"
import { TopCustomers } from "./_components/TopCustomers"
import { ConversionFunnel } from "./_components/ConversionFunnel"
import { ActivityFeed } from "./_components/ActivityFeed"
import { SalesByCategory } from "./_components/SalesByCategory"
import { QuickStats } from "./_components/QuickStats"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's what's happening with your business today.
                </p>
            </div>

            {/* Main Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value="$125,430"
                    change="+12.5%"
                    changeType="positive"
                    icon={DollarSign}
                    description="From last month"
                />
                <StatCard
                    title="Orders"
                    value="1,234"
                    change="+8.2%"
                    changeType="positive"
                    icon={ShoppingCart}
                    description="New orders today"
                />
                <StatCard
                    title="Customers"
                    value="5,678"
                    change="+15.3%"
                    changeType="positive"
                    icon={Users}
                    description="Active customers"
                />
                <StatCard
                    title="Growth"
                    value="+23.1%"
                    change="+5.4%"
                    changeType="positive"
                    icon={TrendingUp}
                    description="Month over month"
                />
            </div>

            {/* Quick Stats */}
            <QuickStats />

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <RevenueChart />
                <SalesChart />
            </div>

            {/* Secondary Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SalesByCategory />
                <ConversionFunnel />
                <TopProducts />
            </div>

            {/* Bottom Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <RecentTransactions />
                <div className="grid gap-4">
                    <TopCustomers />
                    <ActivityFeed />
                </div>
            </div>
        </div>
    )
}

