// Token storage using localStorage

const TOKEN_KEY = "nexterp_token"

export const tokenStorage = {
    getToken(): string | null {
        if (typeof window === "undefined") return null
        return localStorage.getItem(TOKEN_KEY)
    },

    saveToken(token: string): void {
        if (typeof window === "undefined") return
        localStorage.setItem(TOKEN_KEY, token)
    },

    clearToken(): void {
        if (typeof window === "undefined") return
        localStorage.removeItem(TOKEN_KEY)
    },
}
