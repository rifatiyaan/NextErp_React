import type { FieldValues, UseFormSetError, Path } from "react-hook-form"
import { APIError } from "@/lib/api/client"

/**
 * Map an HTTP 422 ValidationException response (per-field errors) onto the form
 * via react-hook-form's `setError`. Field names from the backend are
 * PascalCase / nested-dot (e.g. `Items[0].Quantity`); we lowercase the first
 * segment to match the typical TS schema convention.
 *
 * Use inside a mutation's `onError` for forms:
 *
 *   const { setError } = useForm(...)
 *   const create = useCreateProduct()
 *   create.mutate(input, {
 *       onError: (error) => applyValidationErrors(error, setError),
 *   })
 *
 * Returns `true` if errors were mapped (caller can then suppress its own toast),
 * `false` for non-422 errors (caller should show a generic message or rely on
 * the global toast handler).
 */
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

/**
 * Convert backend property paths to form field names.
 *   "Title"             -> "title"
 *   "Items[0].Quantity" -> "items.0.quantity"   (RHF dot path for nested arrays)
 *   "Metadata.Notes"    -> "metadata.notes"
 */
function normalizeFieldName(serverKey: string): string {
    return serverKey
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .map((segment) => segment.charAt(0).toLowerCase() + segment.slice(1))
        .join(".")
}
