import { fetchAPI } from "./client"

export interface BulkVariationOption {
    name: string
    values: string[]
}

export interface VariationValueDto {
    id: number
    value: string
    displayOrder: number
}

export interface VariationOptionDto {
    id: number
    name: string
    displayOrder: number
    values: VariationValueDto[]
}

export const variationAPI = {
    async getOptions(signal?: AbortSignal): Promise<VariationOptionDto[]> {
        return fetchAPI<VariationOptionDto[]>(`/api/variation/options`, { method: "GET", signal })
    },

    async createOption(payload: { name: string; displayOrder?: number }): Promise<{ id: number }> {
        const res = await fetchAPI<{ id: number }>(`/api/variation/options`, {
            method: "POST",
            body: JSON.stringify({ name: payload.name, displayOrder: payload.displayOrder ?? 0 }),
        })
        return res
    },

    async createValue(optionId: number, payload: { value: string; displayOrder?: number }): Promise<{ id: number }> {
        return fetchAPI<{ id: number }>(`/api/variation/options/${optionId}/values`, {
            method: "POST",
            body: JSON.stringify({ value: payload.value, displayOrder: payload.displayOrder ?? 0 }),
        })
    },

    async getOptionsByProduct(productId: number, signal?: AbortSignal): Promise<VariationOptionDto[]> {
        return fetchAPI<VariationOptionDto[]>(`/api/variation/product/${productId}/options`, { method: "GET", signal })
    },

    async assignOptionToProduct(productId: number, variationOptionId: number, displayOrder?: number): Promise<{ id: number }> {
        return fetchAPI<{ id: number }>(`/api/variation/product/${productId}/assign-option`, {
            method: "POST",
            body: JSON.stringify({ variationOptionId, displayOrder: displayOrder ?? 0 }),
        })
    },

    async unassignOptionFromProduct(productId: number, variationOptionId: number): Promise<void> {
        return fetchAPI(`/api/variation/product/${productId}/assign-option/${variationOptionId}`, { method: "DELETE" })
    },

    async getBulkOptions(signal?: AbortSignal): Promise<BulkVariationOption[]> {
        return fetchAPI<BulkVariationOption[]>(`/api/variation/bulk/options`, { method: "GET", signal })
    },
}
