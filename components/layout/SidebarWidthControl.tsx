"use client"

import { useSidebarWidth } from "@/contexts/sidebar-width-context"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SidebarWidthControl() {
    const { widthInRem, setWidthInRem } = useSidebarWidth()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sidebar Width</CardTitle>
                <CardDescription>Adjust the width of the left sidebar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sidebar-width">Width: {widthInRem}rem</Label>
                        <span className="text-sm text-muted-foreground">
                            {Math.round((widthInRem / 16) * 100)}% of viewport
                        </span>
                    </div>
                    <Slider
                        id="sidebar-width"
                        min={12}
                        max={30}
                        step={1}
                        value={[widthInRem]}
                        onValueChange={([value]) => setWidthInRem(value)}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>12rem</span>
                        <span>30rem</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

