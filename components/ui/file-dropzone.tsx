"use client"

import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { Upload, X, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
  value?: (File | string)[]
  onChange?: (files: File[]) => void
  onUrlRemove?: (url: string) => void
  className?: string
  maxFiles?: number
}

export function FileDropzone({
  value = [],
  onChange,
  onUrlRemove,
  className,
  maxFiles = 10,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  ...props
}: FileDropzoneProps) {
  // Separate files (File objects) from URLs (strings)
  const filesOnly = React.useMemo(() => {
    return value.filter((item): item is File => {
      // Check if item is a File object by checking for File-specific properties
      return typeof item !== "string" && 
             item != null && 
             typeof item === "object" &&
             "constructor" in item &&
             item.constructor.name === "File"
    })
  }, [value])
  
  const urlStrings = React.useMemo(() => {
    return value.filter((item): item is string => typeof item === "string")
  }, [value])

  const [files, setFiles] = React.useState<File[]>(filesOnly)

  React.useEffect(() => {
    setFiles(filesOnly)
  }, [filesOnly])

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      onChange?.(newFiles)
    },
    [files, maxFiles, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    ...props,
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onChange?.(newFiles)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, GIF or WEBP (max. 5MB)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {files.length + urlStrings.length} / {maxFiles} files
        </p>
      </div>

      {(files.length > 0 || urlStrings.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Display URL strings (existing images) */}
          {urlStrings.map((url, index) => (
            <div key={`url-${index}`} className="relative group">
              <div className="relative aspect-square w-full overflow-hidden rounded-md border">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Call onUrlRemove callback if provided
                    onUrlRemove?.(url)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                Existing image
              </p>
            </div>
          ))}
          {/* Display File objects (newly uploaded) */}
          {files.map((file, index) => (
            <div key={`file-${index}`} className="relative group">
              <div className="relative aspect-square w-full overflow-hidden rounded-md border">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <File className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

