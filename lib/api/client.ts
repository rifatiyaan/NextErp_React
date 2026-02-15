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
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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
            // For development with self-signed certificates
            // Note: This only works in Node.js, browsers will still validate certificates
            // For browser, user must accept the certificate warning
        })

        // Handle non-JSON responses
        const contentType = response.headers.get("content-type")
        const isJSON = contentType?.includes("application/json")

        if (!response.ok) {
            const errorData = isJSON ? await response.json() : await response.text()
            console.error(`API Error ${response.status} at ${url}:`, errorData)
            
            let errorMessage = "Request failed"
            if (isJSON && errorData) {
                if (typeof errorData === "object" && errorData.message) {
                    errorMessage = errorData.message
                } else if (typeof errorData === "string") {
                    errorMessage = errorData
                }
            } else if (typeof errorData === "string") {
                errorMessage = errorData
            }
            
            throw new APIError(
                errorMessage,
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
        const errorMessage = error instanceof Error ? error.message : "Network error"
        
        // Provide more helpful error messages
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
            console.error(`Failed to connect to API at ${url}. Possible causes:
                1. Backend server is not running
                2. SSL certificate not accepted (visit https://localhost:7245/index.html first)
                3. CORS issue
                4. Network connectivity problem`)
        }
        
        throw new APIError(
            errorMessage,
            0
        )
    }
}
