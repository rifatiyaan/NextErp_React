import { tokenStorage } from "@/lib/auth/storage"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7245"

export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message)
        this.name = "APIError"
    }
}

export async function fetchAPI<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = tokenStorage.getToken()

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`
    }

    const url = `${API_BASE_URL}${endpoint}`

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        })

        // Handle non-JSON responses
        const contentType = response.headers.get("content-type")
        const isJSON = contentType?.includes("application/json")

        if (!response.ok) {
            const errorData = isJSON ? await response.json() : await response.text()
            throw new APIError(
                errorData?.message || errorData || "Request failed",
                response.status,
                errorData
            )
        }

        // Return parsed JSON or null for 204 No Content
        if (response.status === 204) {
            return null as T
        }

        return isJSON ? await response.json() : (await response.text() as any)
    } catch (error) {
        if (error instanceof APIError) {
            throw error
        }
        // Network or other errors
        throw new APIError(
            error instanceof Error ? error.message : "Network error",
            0
        )
    }
}
