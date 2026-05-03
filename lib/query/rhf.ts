import type { FieldValues, UseFormSetError, Path } from "react-hook-form"
import { APIError } from "@/lib/api/client"

export function applyValidationErrors<T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
): boolean {
    if (!(error instanceof APIError) || !error.isValidation || !error.validationErrors) {
        return false
    }

    let mapped = 0
    for (const [serverKey, messages] of Object.entries(error.validationErrors)) {
        if (!messages?.length) continue
        const fieldName = normalizeFieldName(serverKey) as Path<T>
        setError(fieldName, { type: "server", message: messages[0] })
        mapped++
    }
    return mapped > 0
}

function normalizeFieldName(serverKey: string): string {
    return serverKey
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .map((segment) => segment.charAt(0).toLowerCase() + segment.slice(1))
        .join(".")
}
