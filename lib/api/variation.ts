import { fetchAPI } from "./client" 

export interface BulkVariationOption {
    name: string
    values: string[]
}

export const variationAPI = {
    /**
     * Get all distinct variation options across all products
     */
    async getBulkOptions(): Promise<BulkVariationOption[]> {
        const response = await fetchAPI<BulkVariationOption[]>(`/api/variation/bulk/options`, {
            method: "GET",
        })
        return response
    },
}

