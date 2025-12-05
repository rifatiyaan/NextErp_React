"use client"

import { MainLayout } from "@/containers/layout/MainLayout"

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-card rounded-lg shadow-sm border">
            <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
            <div className="text-2xl font-bold mt-2">$45,231.89</div>
            <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-sm border">
            <h3 className="font-semibold text-sm text-muted-foreground">Subscriptions</h3>
            <div className="text-2xl font-bold mt-2">+2350</div>
            <p className="text-xs text-muted-foreground mt-1">+180.1% from last month</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-sm border">
            <h3 className="font-semibold text-sm text-muted-foreground">Sales</h3>
            <div className="text-2xl font-bold mt-2">+12,234</div>
            <p className="text-xs text-muted-foreground mt-1">+19% from last month</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-sm border">
            <h3 className="font-semibold text-sm text-muted-foreground">Active Now</h3>
            <div className="text-2xl font-bold mt-2">+573</div>
            <p className="text-xs text-muted-foreground mt-1">+201 since last hour</p>
          </div>
        </div>
        <div className="min-h-[400px] flex items-center justify-center rounded-lg border border-dashed bg-muted/50">
          <p className="text-muted-foreground">Charts and complex widgets coming soon...</p>
        </div>
      </div>
    </MainLayout>
  )
}
