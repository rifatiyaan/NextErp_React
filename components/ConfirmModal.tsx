"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export interface ConfirmModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: () => void | Promise<void>
    confirmLabel?: string
    cancelLabel?: string
    isLoading?: boolean
}

export function ConfirmModal({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = "Yes",
    cancelLabel = "No",
    isLoading: externalLoading = false,
}: ConfirmModalProps) {
    const [internalLoading, setInternalLoading] = useState(false)
    const isLoading = externalLoading || internalLoading

    const handleConfirm = async () => {
        setInternalLoading(true)
        try {
            await onConfirm()
            onOpenChange(false)
        } finally {
            setInternalLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => isLoading && e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                {confirmLabel}
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
