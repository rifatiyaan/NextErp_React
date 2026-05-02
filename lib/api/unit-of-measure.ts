import { fetchAPI } from "@/lib/api/client"
import type { UnitOfMeasure } from "@/lib/types/unit-of-measure"

export const unitOfMeasureAPI = {
    async getAll(signal?: AbortSignal): Promise<UnitOfMeasure[]> {
        return fetchAPI<UnitOfMeasure[]>("/api/UnitOfMeasure", { signal })
    },

    async getById(id: number, signal?: AbortSignal): Promise<UnitOfMeasure> {
        return fetchAPI<UnitOfMeasure>(`/api/UnitOfMeasure/${id}`, { signal })
    },

    async create(data: { name: string; abbreviation: string; category?: string | null }): Promise<UnitOfMeasure> {
        return fetchAPI<UnitOfMeasure>("/api/UnitOfMeasure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
    },

    async update(id: number, data: { name: string; abbreviation: string; category?: string | null; isActive: boolean }): Promise<void> {
        return fetchAPI<void>(`/api/UnitOfMeasure/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
    },

    async delete(id: number): Promise<void> {
        return fetchAPI<void>(`/api/UnitOfMeasure/${id}`, { method: "DELETE" })
    },
}
