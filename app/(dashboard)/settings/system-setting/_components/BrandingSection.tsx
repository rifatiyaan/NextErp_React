"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { ImageIcon, Loader2, Upload, X } from "lucide-react"
import { useUploadCompanyLogo } from "@/hooks/use-system-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/**
 * Branding panel — company name + logo upload.
 *
 * The logo upload uses `useUploadCompanyLogo` (silent mutation, the form
 * shows its own progress UI). On successful upload the URL is propagated
 * up to the parent's draft state — the actual PUT happens when the user
 * clicks Save on the page so all settings commit atomically.
 */
interface BrandingSectionProps {
    companyName: string | null
    companyLogoUrl: string | null
    onCompanyNameChange: (next: string) => void
    onCompanyLogoUrlChange: (next: string | null) => void
}

const ACCEPTED_TYPES = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "image/svg+xml": [".svg"],
}

export function BrandingSection({
    companyName,
    companyLogoUrl,
    onCompanyNameChange,
    onCompanyLogoUrlChange,
}: BrandingSectionProps) {
    const upload = useUploadCompanyLogo()

    const onDrop = useCallback(
        (files: File[]) => {
            const file = files[0]
            if (!file) return
            upload.mutate(file, {
                onSuccess: ({ url }) => {
                    onCompanyLogoUrlChange(url)
                    toast.success("Logo uploaded — click Save to apply.")
                },
                onError: (error) => {
                    toast.error(error?.message ?? "Logo upload failed")
                },
            })
        },
        [upload, onCompanyLogoUrlChange],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxSize: 2 * 1024 * 1024,
        multiple: false,
        disabled: upload.isPending,
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-name" className="text-xs font-medium">Company name</Label>
                <Input
                    id="company-name"
                    value={companyName ?? ""}
                    onChange={(e) => onCompanyNameChange(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    maxLength={200}
                    className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                    Shown in the sidebar/topbar header and document footers.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Company logo</Label>

                {companyLogoUrl ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-2">
                        <img
                            src={companyLogoUrl}
                            alt="Company logo"
                            className="size-12 shrink-0 rounded border border-border bg-card object-contain"
                        />
                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                            <p className="text-xs font-medium truncate">Logo set</p>
                            <p className="text-[10px] text-muted-foreground truncate font-mono">
                                {companyLogoUrl}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            onClick={() => onCompanyLogoUrlChange(null)}
                            disabled={upload.isPending}
                            aria-label="Remove logo"
                        >
                            <X className="size-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border p-4 text-center transition-colors",
                            isDragActive && "border-primary bg-primary/5",
                            upload.isPending && "opacity-50 cursor-wait",
                        )}
                    >
                        <input {...getInputProps()} />
                        {upload.isPending ? (
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        ) : (
                            <ImageIcon className="size-5 text-muted-foreground" />
                        )}
                        <p className="text-xs">
                            <span className="font-medium">
                                {upload.isPending ? "Uploading…" : "Drop a logo here"}
                            </span>
                            {!upload.isPending && (
                                <span className="text-muted-foreground"> or click to browse</span>
                            )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            PNG · JPG · WebP · SVG · max 2 MB · recommended 200×200
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
