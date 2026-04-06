"use client"

import React from "react"
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface PageBreadcrumbItemType {
    label: string
    href?: string
}

interface PageBreadcrumbProps {
    items: PageBreadcrumbItemType[]
    variant?: "page" | "header" | "dock"
}

export function PageBreadcrumb({ items, variant = "page" }: PageBreadcrumbProps) {
    if (!items?.length) return null
    const isDenseRow = variant === "header" || variant === "dock"
    return (
        <Breadcrumb
            className={
                isDenseRow
                    ? "mb-0 min-w-0 flex-1"
                    : "mb-3 sm:mb-4"
            }
        >
            <BreadcrumbList
                className={
                    isDenseRow
                        ? "flex-nowrap gap-1 overflow-x-auto text-xs sm:gap-1.5 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
                        : undefined
                }
            >
                {items.map((item, index) => {
                    const isLast = index === items.length - 1
                    return (
                        <React.Fragment key={index}>
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : item.href ? (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
